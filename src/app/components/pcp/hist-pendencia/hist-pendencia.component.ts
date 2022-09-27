import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PendenciaLocal } from 'src/app/models/localFacao';
import { Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'fc-hist-pendencia',
  templateUrl: './hist-pendencia.component.html',
  styleUrls: ['./hist-pendencia.component.scss'],
})
export class HistPendenciaComponent implements OnInit {
  // TODO:
  // make this an enum to change in Auditor and PCP
  ignoredStatus = ['Em análise', 'Almoxarifado', 'Enviado'];

  fileName = 'Pendencias_Historico.xlsx';

  statusPendencia: string[] = [];
  selectedStatusPendencia: string = '';

  solicitanteEnum: string[] = [];
  selectedSolicitante: string[] = [];
  idSelectedSolicitante: number[] = [];

  loading = new BehaviorSubject<boolean>(true);
  loadingError = false;
  isEmptyList = false;

  minhasPendencias: Pendencias = [];
  minhasPendenciasLocal: PendenciaLocal[] = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);
  minhasPendenciasLocal$: BehaviorSubject<PendenciaLocal[]> =
    new BehaviorSubject<PendenciaLocal[]>([]);

  filteredArray: PendenciaLocal[] = [];

  constructor(
    private _location: Location,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    let usuario = '';
    this._userService.getUser().subscribe((_) => (usuario = _.nome!));
    this._pendenciaService.listPendencia().subscribe({
      next: (pendencias) => {
        this.minhasPendencias = pendencias;
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) => !this.ignoredStatus.includes(pendencia.STATUS)
        );

        let flatCdLocal = this.minhasPendencias.flatMap((_) => _.CD_LOCAL + '');

        this._opsService.getLocalFaccao().subscribe({
          next: (local) => {
            // passar por todos os locais e adicionar na variavel minhasPendenciasLocal os que forem encontrados no flatCdLocal
            local.forEach((lcod) => {
              if (flatCdLocal.includes(lcod.CD_LOCAL)) {
                let tmpPendencia: Pendencias = [];
                // passar por todas as pendencias e incluir em cada local
                this.minhasPendencias.forEach((pendencia) => {
                  pendencia.cod =
                    pendencia.NR_CICLO +
                    '-' +
                    pendencia.NR_OP +
                    '-' +
                    pendencia.CD_REFERENCIA;
                  if (lcod.CD_LOCAL == pendencia.CD_LOCAL + '') {
                    tmpPendencia.push(pendencia);
                  }
                });
                this.minhasPendenciasLocal.push({
                  local: lcod.CD_LOCAL + ' - ' + lcod.DS_LOCAL,
                  pendencias: tmpPendencia,
                });
              }
            });
            let tmpSolicitante: string[] = [];
            this.minhasPendenciasLocal.forEach((_) => {
              let teste = _.pendencias.flatMap((x) => x.USUARIO);
              tmpSolicitante.push(...teste);
            });
            // set the solicitante dropdown
            this.solicitanteEnum = Array.from(new Set(tmpSolicitante));

            this.orderByQntPendencia(this.minhasPendenciasLocal);
            this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          },
          error: (err) => {
            console.warn(err);
          },
        });

        this._setTituloService.setTitle('Histórico de Pendências');
        this.loading.next(false);
      },
      error: (err) => {
        this.isEmptyList = true;
        this.loading.next(false);
      },
    });
  }

  filtroOP(event: Event): void {
    document.getElementById('filtro-op')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;

    this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
    this.filteredArray = this.minhasPendenciasLocal;
    // se filtro status
    // verificar se o filtro solicitante está ativo e filtrar os dois
    // caso contrário filtrar somente status
    if (filterValue.length > 0) {
      this.filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) => p.cod?.includes(filterValue)),
        };
        return filtered;
      });
      this.filteredArray = this.filteredArray.filter((_) => _.pendencias.length > 0);
      this.orderByQntPendencia(this.filteredArray);
      this.minhasPendenciasLocal$.next(this.filteredArray);
    }
  }

  filtroDropdown() {
    (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
    this.selectedSolicitante = [];
    this.idSelectedSolicitante.forEach((x) => {
      this.selectedSolicitante.push(this.solicitanteEnum[x]);
    });

    this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
    // se filtro status
    // verificar se o filtro solicitante está ativo e filtrar os dois
    // caso contrário filtrar somente status
    if (this.selectedSolicitante.length > 0) {
      this.filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) =>
            this.selectedSolicitante.includes(p.USUARIO)
          ),
        };
        return filtered;
      });
      this.filteredArray = this.filteredArray.filter((_) => _.pendencias.length > 0);
      this.orderByQntPendencia(this.filteredArray);
      this.minhasPendenciasLocal$.next(this.filteredArray);
    }
  }

  orderByQntPendencia(arrayToSort: PendenciaLocal[]) {
    arrayToSort.sort((a, b) => {
      return a.pendencias.length < b.pendencias.length
        ? 1
        : b.pendencias.length < a.pendencias.length
        ? -1
        : 0;
    });
  }

  exportexcel(): void {
    /* table id is passed over here */
    let excelList = [
      [
        'CD_PENDENCIA',
        'cod',
        'CD_LOCAL',
        'NR_CICLO',
        'NR_OP',
        'CD_REFERENCIA',
        'DS_CLASSIFICACAO',
        'CD_PRODUTO_MP',
        'DS_PRODUTO_MP',
        'TAMANHO',
        'QT_SOLICITADO',
        'USUARIO',
        'STATUS',
        'DT_SOLICITACAO',
        'Obs',
        'CORTE',
      ],
    ];
    this.filteredArray.forEach((pendenciasLocal) => {
      pendenciasLocal.pendencias.forEach((pendenciaLocal) => {
        let excelFile = [
          pendenciaLocal.CD_PENDENCIA + '',
          pendenciaLocal.cod + '',
          pendenciaLocal.CD_LOCAL + '',
          pendenciaLocal.NR_CICLO + '',
          pendenciaLocal.NR_OP + '',
          pendenciaLocal.CD_REFERENCIA + '',
          pendenciaLocal.DS_CLASSIFICACAO + '',
          pendenciaLocal.CD_PRODUTO_MP + '',
          pendenciaLocal.DS_PRODUTO_MP + '',
          pendenciaLocal.TAMANHO + '',
          pendenciaLocal.QT_SOLICITADO + '',
          pendenciaLocal.USUARIO + '',
          pendenciaLocal.STATUS + '',
          pendenciaLocal.DT_SOLICITACAO + '',
          pendenciaLocal.Obs + '',
          pendenciaLocal.CORTE + '',
        ];
        excelList.push(excelFile);
      });
    });

    /* generate workbook and add the worksheet */
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelList);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilha1');
    // var fmt = '@';
    // wb.Sheets['Sheet1']['F'] = fmt;

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  voltar() {
    this._location.back();
  }
}

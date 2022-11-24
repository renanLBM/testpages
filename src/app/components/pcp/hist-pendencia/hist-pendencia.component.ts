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
        this.minhasPendencias = JSON.parse(pendencias.data);
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) =>
            !this.ignoredStatus.includes(pendencia.DS_STATUS_PENDENCIA)
        );

        this.minhasPendencias.forEach((pendencia) => {
          pendencia.DT_SOLICITACAO = new Date(pendencia.DT_SOLICITACAO).toLocaleString('pt-Br');
          pendencia.cod =
            pendencia.NR_CICLO +
            '-' +
            pendencia.NR_OP +
            '-' +
            pendencia.CD_REFERENCIA;

          if (this.minhasPendenciasLocal.length > 0) {
            if (
              this.minhasPendenciasLocal.filter(
                (l) =>
                  l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL
              ).length
            ) {
              this.minhasPendenciasLocal
                .filter(
                  (l) =>
                    l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL
                )[0]
                .pendencias.push(pendencia);
            } else {
              this.minhasPendenciasLocal.push({
                local: pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL,
                pendencias: [pendencia],
              });
            }
          } else {
            this.minhasPendenciasLocal.push({
              local: pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL,
              pendencias: [pendencia],
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
      this.filteredArray = this.filteredArray.filter(
        (_) => _.pendencias.length > 0
      );
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
      this.filteredArray = this.filteredArray.filter(
        (_) => _.pendencias.length > 0
      );
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
        'QT_OP',
        'MOTIVO',
      ],
    ];
    let pendenciaExcel = this.filteredArray;
    if (pendenciaExcel.length == 0) {
      pendenciaExcel = this.minhasPendenciasLocal;
    }
    pendenciaExcel.forEach((pendenciasLocal) => {
      pendenciasLocal.pendencias.forEach((pendenciaLocal) => {
        let excelFile = [
          pendenciaLocal.CD_PENDENCIA + '',
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
          pendenciaLocal.DS_STATUS_PENDENCIA + '',
          pendenciaLocal.DT_SOLICITACAO + '',
          pendenciaLocal.OBS + '' == 'null' ? '' : pendenciaLocal.OBS + '',
          pendenciaLocal.CORTE + '' == 'null' ? '' : pendenciaLocal.CORTE + '',
          pendenciaLocal.QT_OP_HIST + '',
          pendenciaLocal.DS_MOTIVO_PENDENCIA + '',
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

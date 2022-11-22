import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { BehaviorSubject, zip } from 'rxjs';
import { StatusPendencia } from 'src/app/models/enums/enumStatusPendencia';
import { PendenciaLocal } from 'src/app/models/localFacao';
import { Pendencia, Pendencias } from 'src/app/models/pendencia';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'fc-pcppendencias',
  templateUrl: './pcp-pendencias.component.html',
  styleUrls: ['./pcp-pendencias.component.scss'],
})
export class PCPPendenciasComponent implements OnInit {

  // TODO:
  // make this an enum to change in Auditor and PCP
  ignoredStatus = ['Finalizado', 'Recusado'];

  fileName = 'Pendencias.xlsx';

  statusEnum = ['Em análise', 'Almoxarifado', 'Enviado'];
  selectedStatus: string[] = [];
  idSelectedStatus: number[] = [];

  solicitanteEnum: string[] = [];
  selectedSolicitante: string[] = [];
  idSelectedSolicitante: number[] = [];

  statusPendencia: string[] = [];
  selectedStatusPendencia: string = '';

  loading = new BehaviorSubject<boolean>(true);
  loadingAtualization = new BehaviorSubject<boolean>(true);

  minhasPendencias: Pendencias = [];
  minhasPendenciasLocal: PendenciaLocal[] = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);
  minhasPendenciasLocal$: BehaviorSubject<PendenciaLocal[]> =
    new BehaviorSubject<PendenciaLocal[]>([]);

  filteredArray: PendenciaLocal[] = [];

  constructor(
    private toastrService: NbToastrService,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    Object.values(StatusPendencia).forEach((_) => {
      if (typeof _ == 'string') {
        this.statusPendencia.push(_);
      }
    });

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
          pendencia.display_name = !!pendencia.CORTE ? pendencia.CD_PRODUTO_MP+" - "+pendencia.DS_PRODUTO_MP+" - "+pendencia.CORTE : pendencia.CD_PRODUTO_MP+" - "+pendencia.DS_PRODUTO_MP;
          pendencia.DT_SOLICITACAO = new Date(pendencia.DT_SOLICITACAO).toLocaleString('pt-Br');
          pendencia.cod =
            pendencia.NR_CICLO +
            '-' +
            pendencia.NR_OP +
            '-' +
            pendencia.CD_REFERENCIA;

          if (this.minhasPendenciasLocal.length > 0) {
            if (this.minhasPendenciasLocal.filter((l) => l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL).length){
              this.minhasPendenciasLocal.filter((l) => l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL)[0].pendencias.push(pendencia);
            }else{
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
        this.solicitanteEnum = this.solicitanteEnum.sort((a, b) => {
          if (a > b) {
            return 1;
          } else if (b > a) {
            return -1;
          } else {
            return 0;
          }
        });

        this.orderByQntPendencia(this.minhasPendenciasLocal);
        this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);

        this._setTituloService.setTitle('Pendências');
        this.loading.next(false);
        this.loadingAtualization.next(false);
      },
      error: (err) => {
        this.loadingAtualization.next(false);
        this.loading.next(false);
      },
    });
  }

  alterarStatus(event: Event, pendencia: Pendencia): void {
    pendencia.MODIFICADO_POR = this._userService.getSession().nome;
    pendencia.DT_MODIFICACAO = new Date(Date.now()).toLocaleString('pt-Br');
    this.loadingAtualization.next(true);

    let elementSelect = event.target as HTMLSelectElement;
    const novoStatus = elementSelect.value.split('_')[0];
    const cd_novoStatus = StatusPendencia[novoStatus as keyof typeof StatusPendencia] +1;

    pendencia.CD_NovoStatus = !!cd_novoStatus ? cd_novoStatus : 0;
    pendencia.DS_NovoStatus = !!novoStatus ? StatusPendencia[cd_novoStatus-1] : '';
    let data_ajustada = pendencia.DT_MODIFICACAO?.split(' ');
    pendencia.DT_MODIFICACAO = data_ajustada![0].split("/").reverse().join('-') + ' ' + data_ajustada![1];


    this._pendenciaService.editPendencia(pendencia).subscribe({
      next: (ret) => {
        if (ret == 1) {
          this.toastrService.success(
            'Alteração salva com sucesso!',
            'Sucesso!!!',
            {
              preventDuplicates: true,
            }
          );
          pendencia.alterado = true;
          this.loadingAtualization.next(false);
        }
      },
      error: (err) => {
        this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
          preventDuplicates: true,
        });
        this.loadingAtualization.next(false);
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
    this.selectedStatus = [];
    this.idSelectedStatus.forEach((x) => {
      this.selectedStatus.push(this.statusEnum[x]);
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
      if (this.selectedStatus.length > 0) {
        this.filteredArray = this.filteredArray.map((_) => {
          let filtered = {
            ..._,
            pendencias: _.pendencias.filter((p) =>
              this.selectedStatus.includes(p.DS_STATUS_PENDENCIA)
            ),
          };
          return filtered;
        });
      }
      this.filteredArray = this.filteredArray.filter(
        (_) => _.pendencias.length > 0
      );
      this.orderByQntPendencia(this.filteredArray);
      this.minhasPendenciasLocal$.next(this.filteredArray);
    } else if (this.selectedStatus.length > 0) {
      this.filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) =>
            this.selectedStatus.includes(p.DS_STATUS_PENDENCIA)
          ),
        };
        return filtered;
      });
      if (this.selectedSolicitante.length > 0) {
        this.filteredArray = this.filteredArray.map((_) => {
          let filtered = {
            ..._,
            pendencias: _.pendencias.filter((p) =>
              this.selectedSolicitante.includes(p.USUARIO)
            ),
          };
          return filtered;
        });
      }
      this.filteredArray = this.filteredArray.filter(
        (_) => _.pendencias.length > 0
      );
      this.orderByQntPendencia(this.filteredArray);
      this.minhasPendenciasLocal$.next(this.filteredArray);
    }
  }

  exportexcel(): void {
    /* table id is passed over here */
    let excelFile = [
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
        let teste = [
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
          pendenciaLocal.DS_STATUS_PENDENCIA + '',
          pendenciaLocal.DT_SOLICITACAO + '',
          pendenciaLocal.OBS + '',
          pendenciaLocal.CORTE + '',
          pendenciaLocal.QT_OP + '',
          pendenciaLocal.MOTIVO + '',
        ];
        excelFile.push(teste);
      });
    });

    /* generate workbook and add the worksheet */
    // const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelFile);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilha1');
    // var fmt = '@';
    // wb.Sheets['Sheet1']['F'] = fmt;

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
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
}

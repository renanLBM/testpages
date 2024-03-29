import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { Apontamento, Apontamentos } from 'src/app/models/apontamento';
import { ApontamentoListParado } from 'src/app/models/enums/enumApontamentos';
import { Motivo, Motivos } from 'src/app/models/motivo';
import { OPDescricoes } from 'src/app/models/opdescricao';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';

import { ApontamentoService } from 'src/app/services/apontamento.service';
import { AtrasoService } from 'src/app/services/atraso.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

const MILISEG_EM_UM_DIA = 24 * 3600 * 1000;
const AJUSTE_3_HORAS = 10800000;

@Component({
  selector: 'fc-pcp-desc-ops',
  templateUrl: './pcp-desc-ops.component.html',
  styleUrls: ['./pcp-desc-ops.component.scss'],
})
export class PcpDescOpsComponent implements OnInit {
  datePipe = new DatePipe('pt-Br');
  dtOptions: any;
  dtTrigger: Subject<any> = new Subject<any>();
  selectedFilters = {
    origem: '',
    colecao: '',
    apontamentoFilter: '',
  };

  tituloStatus: string = '';
  tituloLocal: string = '';
  facIdStatus: string = '';
  origemStatus: string = '';
  emptyList: boolean = false;
  filtroAtivo: boolean = false;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  apontamentoList!: Apontamentos;
  apontamento!: Apontamento;
  faccaoList: OPs = [];
  motivoList: Motivos = [];
  faccao: OPDescricoes = [];
  listOPs$: BehaviorSubject<OPs> = new BehaviorSubject(this.faccaoList);

  dtHoje = new Date();
  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  constructor(
    public _loadingService: LoadingService,
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    private _atrasoService: AtrasoService,
    private _apontamentoService: ApontamentoService,
    private _exportExcelService: ExportExcelService,
    private _route: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {

    this.dtHoje.setHours(0,0,0,0);
    this._setTitle.setTitle('Carregando...');
    this.selectedFilters = this._opsFilteredService.getFilter();

    this._apontamentoService.getApontamento().subscribe((a) => {
      this.apontamentoList = this.filterApontamento(JSON.parse(a.data));
      this._atrasoService.getMotivos().subscribe((m) => {
        this.motivoList = JSON.parse(m.data);

        this.dtOptions = {
          language: LanguagePtBr.ptBr_datatable,
          pagingType: 'full_numbers',
          pageLength: 15,
          responsive: true,
          processing: true,
          order: [[5, 'asc']],
          dom: 'Bfrtip',
          buttons: [],
        };

        this.tituloStatus = this._route.snapshot.paramMap.get('status')!;
        this.facIdStatus = this._route.snapshot.paramMap.get('faccaoid')!;
        this.origemStatus = this._route.snapshot.paramMap.get('origem')!;
        this._setTitle.setTitle(this.tituloStatus);

        const dataFromSession = this._opsService.getSessionData();
        if (this.tituloStatus == 'Total') {
          if (!!dataFromSession.length) {
            let opsList = this.filterOPs(dataFromSession);
            this.getOPS(opsList);
            this.listOPs$.next(this.faccaoList);
            this.dtTrigger.next(this.dtOptions);
          } else {
            this._opsService.getAllOPs().subscribe({
              next: (list) => {
                let opsList = this.filterOPs(JSON.parse(list.data));
                this.getOPS(opsList);

                this.listOPs$.next(this.faccaoList);
                this.dtTrigger.next(this.dtOptions);
              },
              error: (err: Error) => {
                console.error(err);
                this._setTitle.setTitle('Erro');
              },
            });
          }
        } else {
          if (!!dataFromSession.length) {
            let opsList = dataFromSession.filter((ops) => {
              return ops.Status == this.tituloStatus;
            });
            opsList = this.filterOPs(opsList);
            this.getOPS(opsList);
            this.listOPs$.next(this.faccaoList);
            this.dtTrigger.next(this.dtOptions);
          } else {
            this._opsService.getOpByStatus(this.tituloStatus).subscribe({
              next: (list) => {
                let opsList = this.filterOPs(JSON.parse(list.data));
                this.getOPS(opsList);

                this.listOPs$.next(this.faccaoList);
                this.dtTrigger.next(this.dtOptions);
              },
              error: (err: Error) => {
                console.error(err);
                this._setTitle.setTitle('Erro');
              },
            });
          }
        }
      });
    });
  }

  getOPS(thisOPs: OPs) {
    this.faccaoList = thisOPs;
    this.tituloLocal = this.tituloStatus;
    if (this.origemStatus) {
      this.faccaoList = this.faccaoList.filter(
        (x) => x.DS_TIPO == this.origemStatus
      );
    }
    if (this.facIdStatus != '99999') {
      this.faccaoList = this.faccaoList.filter(
        (x) => x.CD_LOCAL == parseInt(this.facIdStatus)
      );
      this.tituloLocal = this.faccaoList[0].DS_LOCAL;
    }
    this.faccaoList.map((x) => {
      if (!x.DT_PREVRETORNO) {
        x.dt_ajustada = new Date('2022-01-01')
          .toLocaleString('pt-Br', { timeZone: 'UTC' })
          .substring(0, 10);
      } else {
        x.dt_ajustada = new Date(+x.DT_PREVRETORNO)
          .toLocaleString('pt-Br', { timeZone: 'UTC' })
          .substring(0, 10);
      }

      x.css_class = x.Status == 'Em atraso' ? 'atraso' : 'andamento';

      let atraso!: Motivo;
      if (this.motivoList.toString() != 'error') {
        atraso = this.motivoList.filter(
          (_) => _.CD_PRODUCAO == x.CD_PRODUCAO
        )[0];
      }

      let apontamento!: Apontamento;
      if (this.apontamentoList.toString() != 'error') {
        apontamento = this.apontamentoList.filter(
          (_) =>
            _.NR_REDUZIDOOP + '-' + _.CD_LOCAL ==
            x.NR_REDUZIDOOP! + '-' + x.CD_LOCAL
        )[0];
      }

      if (!x.DS_COORDENADO) {
        x.DS_COORDENADO = x.DS_GRUPO;
      }
      let dt_entrada = new Date(+x.DT_ENTRADA);
      x['dias_faccao'] = Math.floor(
        (this.dtHoje.getTime() - dt_entrada.getTime()) / MILISEG_EM_UM_DIA
      );

      x['motivo_atraso'] = '-';
      x['nova_previsao'] = '-';

      //  verifica se teve atraso para essa OP

      if (atraso) {
        let dtNovaPrev = new Date(+atraso.DT_PREV_RETORNO_NOVA);
        if (+dtNovaPrev >= +this.dtHoje - AJUSTE_3_HORAS) {
          x['motivo_atraso'] = atraso.DS_ATRASO_DS;
          x['nova_previsao'] = dtNovaPrev
            .toLocaleString('pt-Br', { timeZone: 'UTC' })
            .substring(0, 10);
        }

        if (
          atraso.DS_ATRASO_DS == 'Adiantamento' &&
          +atraso.DT_PREV_RETORNO_NOVA >= atraso.DT_PREVRETORNO!
        ) {
          x['motivo_atraso'] = '-';
          x['nova_previsao'] = '-';
        } else if (
          atraso.DS_ATRASO_DS != 'Adiantamento' &&
          +atraso.DT_PREV_RETORNO_NOVA <= atraso.DT_PREVRETORNO!
        ) {
          x['motivo_atraso'] = '-';
          x['nova_previsao'] = '-';
        }
      }

      //  verifica se teve apontamento para essa OP
      let apontamentoShowed: string;
      apontamentoShowed = apontamento ? apontamento.DS_APONTAMENTO_DS! : '-';
      apontamentoShowed = apontamentoShowed.includes('Parado')
        ? 'Parado'
        : apontamentoShowed;
      if (!apontamentoShowed.includes('-')) {
        x['DS_APONTAMENTO_DS'] =
          '0' +
          ApontamentoListParado[
            apontamentoShowed as keyof typeof ApontamentoListParado
          ] +
          ' - ' +
          apontamento.DS_APONTAMENTO_DS;
        x['DT_MODIFICACAO'] = apontamento.DT_MODIFICACAO;
      } else {
        x['DS_APONTAMENTO_DS'] = '-';
        x['DT_MODIFICACAO'] = '';
      }
    });
  }

  filterOPs(OPList: OPs) {
    let { origem, colecao, apontamentoFilter } = this.selectedFilters;
    let listFilteredOPs = OPList;

    // filtra as ops de acordo com o status filtrado
    if (!!apontamentoFilter && apontamentoFilter != 'Não informado') {
      let apCodList = this.apontamentoList.flatMap(
        (ap) => ap.cod + '-' + ap.CD_LOCAL
      );
      listFilteredOPs = listFilteredOPs.filter((x) =>
        apCodList.includes(x.cod! + '-' + x.CD_LOCAL)
      );
    } else if (apontamentoFilter == 'Não informado') {
      let apCodList = this.apontamentoList.flatMap(
        (ap) => ap.cod + '-' + ap.CD_LOCAL
      );
      listFilteredOPs = listFilteredOPs.filter(
        (x) => !apCodList.includes(x.cod! + '-' + x.CD_LOCAL)
      );
    }

    let hasOrigem = origem.length > 0;
    let hasColecao = colecao.length > 0;

    if (hasOrigem && hasColecao) {
      listFilteredOPs = listFilteredOPs.filter(
        (x) => origem.includes(x.DS_CLASS) && colecao.includes(x.NR_CICLO + '')
      );
    } else if (hasOrigem) {
      listFilteredOPs = listFilteredOPs.filter((x) =>
        origem.includes(x.DS_CLASS)
      );
    } else if (hasColecao) {
      listFilteredOPs = listFilteredOPs.filter((x) =>
        colecao.includes(x.NR_CICLO + '')
      );
    }
    return listFilteredOPs;
  }

  // filtra somente os apontamentos com o status filtrado
  filterApontamento(ap: Apontamentos): Apontamentos {
    let { apontamentoFilter } = this.selectedFilters;
    if (!!apontamentoFilter && apontamentoFilter != 'Não informado') {
      return ap.filter((a) => a.Situacao!.includes(apontamentoFilter));
    }
    return ap;
  }

  exportExcel(nomeArquivo: string) {
    switch (nomeArquivo) {
      case 'log_data_retorno':
        this._atrasoService
          .logMotivos()
          .subscribe({
            next: (resp) =>
              this._exportExcelService.exportExcel(resp, nomeArquivo),
          });
        break;

      case 'log_apontamentos':
        this._apontamentoService
        .logApontamento()
        .subscribe({
          next: (resp) =>
            this._exportExcelService.exportExcel(resp, nomeArquivo),
        });
        break;

      case 'faccontrol_ops':
        this._exportExcelService.exportExcel(this.faccaoList, nomeArquivo);
        break;

      default:
        break;
    }
  }

  voltar() {
    this._location.back();
  }
}

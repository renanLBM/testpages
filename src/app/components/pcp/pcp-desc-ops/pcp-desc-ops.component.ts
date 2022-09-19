import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Faccoes } from 'src/app/models/faccao';
import { Motivo, Motivos } from 'src/app/models/motivo';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import { Apontamento, Apontamentos } from 'src/app/models/apontamento';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { ApontamentoList } from 'src/app/models/enums/enumApontamentos';

@Component({
  selector: 'fc-pcp-desc-ops',
  templateUrl: './pcp-desc-ops.component.html',
  styleUrls: ['./pcp-desc-ops.component.scss'],
})
export class PcpDescOpsComponent implements OnInit {
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
  faccao: Faccoes = [];
  listOPs$: BehaviorSubject<OPs> = new BehaviorSubject(this.faccaoList);

  dtHoje = new Date();
  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  constructor(
    public _loadingService: LoadingService,
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private _location: Location
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');
    this.selectedFilters = this._opsFilteredService.getFilter();

    this._auditorService.getApontamento().subscribe((a) => {
      this.apontamentoList = this.filterApontamento(a);
      this._auditorService.getMotivos().subscribe((m) => {
        this.motivoList = m;

        this.dtOptions = {
          language: LanguagePtBr.ptBr_datatable,
          pagingType: 'full_numbers',
          pageLength: 15,
          responsive: true,
          processing: true,
          order: [[5, 'asc']],
          dom: 'Bfrtip',
          buttons: [
            {
              extend: 'print',
              text: '<a style="color: #898989">Imprimir</a>',
              titleAttr: 'Exportar para excel',
            },
            {
              extend: 'excelHtml5',
              text: '<a style="color: #898989">Excel</a>',
              titleAttr: 'Exportar para excel',
            },
          ],
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
          }else {
            this._opsService.getAllOPs().subscribe({
              next: (list) => {
                let opsList = this.filterOPs(list);
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
              return ops.Status == this.tituloStatus
            })
            opsList = this.filterOPs(opsList);
            this.getOPS(opsList);
            this.listOPs$.next(this.faccaoList);
            this.dtTrigger.next(this.dtOptions);
          }else {
            this._opsService.getOpByStatus(this.tituloStatus).subscribe({
              next: (list) => {
                let opsList = this.filterOPs(list);
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
      if (!x.PREV_RETORNO) {
        x.PREV_RETORNO = '01/01/2001 00:00:00';
      }

      let newDtEntrada = x.DT_ENTRADA.split(' ')[0].split('/');
      let dataEntrada = new Date(
        +newDtEntrada[2],
        +newDtEntrada[1] - 1,
        +newDtEntrada[0]
      );
      let newDtPrev = x.PREV_RETORNO.split(' ')[0].split('/');
      x.PREV_RETORNO = newDtPrev[2] + '-' + newDtPrev[1] + '-' + newDtPrev[0];
      let dtPrev = new Date(+newDtPrev[2], +newDtPrev[1] - 1, +newDtPrev[0]);

      x.css_class = dtPrev < this.dtHoje ? 'atraso' : 'andamento';

      let atraso!: Motivo;
      if (this.motivoList.toString() != 'error') {
        atraso = this.motivoList.filter(
          (_) => _.cod + '-' + _.CD_LOCAL == x.cod! + '-' + x.CD_LOCAL
        )[0];
      }

      let apontamento!: Apontamento;
      if (this.apontamentoList.toString() != 'error') {
        apontamento = this.apontamentoList.filter(
          (_) => _.cod + '-' + _.CD_LOCAL == x.cod! + '-' + x.CD_LOCAL
        )[0];
      }

      if (!x.DS_COORDENADO) {
        x.DS_COORDENADO = x.DS_GRUPO;
      }
      x['dias_faccao'] = Math.floor(
        (this.dtHoje.getTime() - dataEntrada.getTime()) / (24 * 3600 * 1000)
      );

      x['motivo_atraso'] = '-';
      x['nova_previsao'] = '-';

      //  verifica se teve atraso para essa OP
      if (atraso) {
        let newDtNovaPrev = atraso.NOVA_PREVISAO.split('/');
        let dtNovaPrev = new Date(
          +newDtNovaPrev[2],
          +newDtNovaPrev[1] - 1,
          +newDtNovaPrev[0]
        );

        if (dtNovaPrev >= this.dtHoje) {
          x['motivo_atraso'] = atraso.MOTIVO;
          x['nova_previsao'] = atraso.NOVA_PREVISAO;
        }
      }

      //  verifica se teve apontamento para essa OP
      let apontamentoShowed: string;
      apontamentoShowed = apontamento ? apontamento.Situacao! : '-';
      apontamentoShowed = apontamentoShowed.includes('Parado')
        ? 'Parado'
        : apontamentoShowed;
      if (!apontamentoShowed.includes('-')) {
        x['apontamento'] =
          '0' +
          ApontamentoList[apontamentoShowed as keyof typeof ApontamentoList] +
          ' - ' +
          apontamento.Situacao;
      } else {
        x['apontamento'] = '-';
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
        (x) => origem.includes(x.DS_CLASS) && colecao.includes(x.DS_CICLO)
      );
    } else if (hasOrigem) {
      listFilteredOPs = listFilteredOPs.filter((x) =>
        origem.includes(x.DS_CLASS)
      );
    } else if (hasColecao) {
      listFilteredOPs = listFilteredOPs.filter((x) =>
        colecao.includes(x.DS_CICLO)
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

  voltar() {
    this._location.back();
  }
}

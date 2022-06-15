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

import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { Apontamento, Apontamentos } from 'src/app/models/apontamento';

@Component({
  selector: 'fc-pcp-desc-ops',
  templateUrl: './pcp-desc-ops.component.html',
  styleUrls: ['./pcp-desc-ops.component.scss'],
})
export class PcpDescOpsComponent implements OnInit {
  faFileExcel = faFileExcel;
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
          pageLength: 25,
          responsive: true,
          autoWidth: true,
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

        if (this.tituloStatus == 'Total') {
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
        } else {
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
      });
    });
  }

  getOPS(thisOPs: OPs) {
    if (this.origemStatus) {
      thisOPs = thisOPs.filter((x) => x.DS_TIPO == this.origemStatus);
    }
    if (this.facIdStatus == '99999') {
      this.faccaoList = thisOPs;
      this.tituloLocal = this.tituloStatus;

      this.faccaoList.map((x) => {
        x.DS_LOCAL = x.DS_LOCAL.replace('COSTURA ', '')
          .replace('CONSERTO ', '')
          .replace('ESTAMPARIA ', '')
          .replace('TERCEIROS ', '');

        x.DT_ENTRADA = `${x.DT_ENTRADA.substring(
          6,
          10
        )}-${x.DT_ENTRADA.substring(3, 5)}-${x.DT_ENTRADA.substring(
          0,
          2
        )}  04:00:00`;
        x.PREV_RETORNO = `${x.PREV_RETORNO.substring(
          6,
          10
        )}-${x.PREV_RETORNO.substring(3, 5)}-${x.PREV_RETORNO.substring(
          0,
          2
        )} 04:00:00`;

        let atraso!: Motivo;
        if (this.motivoList.toString() != 'error') {
          atraso = this.motivoList.filter(
            (_) => _.cod + _.CD_LOCAL == x.cod! + x.CD_LOCAL
          )[0];
        }

        let apontamento!: Apontamento;
        if (this.apontamentoList.toString() != 'error') {
          apontamento = this.apontamentoList.filter(
            (_) => _.cod + _.CD_LOCAL == x.cod! + x.CD_LOCAL
          )[0];
        }

        let hj = new Date();

        let dataEntrada = new Date(x.DT_ENTRADA);
        let dtPrev = new Date(x.PREV_RETORNO);

        x.css_class = 'andamento';
        if (dtPrev < hj) {
          x.css_class = 'atraso';
        }

        if (!x.DS_COORDENADO) {
          x.DS_COORDENADO = x.DS_GRUPO;
        }
        x['dias_faccao'] = Math.floor(
          (hj.getTime() - dataEntrada.getTime()) / (24 * 3600 * 1000)
        );

        //  verifica se teve atraso para essa OP
        if (atraso) {
          x['motivo_atraso'] = atraso.MOTIVO;
          x['nova_previsao'] = atraso.NOVA_PREVISAO;
        } else {
          x['motivo_atraso'] = '-';
          x['nova_previsao'] = '-';
        }

        //  verifica se teve apontamento para essa OP
        if (apontamento) {
          x['apontamento'] = apontamento.Situacao;
        } else {
          x['apontamento'] = '-';
        }
      });
    } else if (thisOPs) {
      this.faccaoList = thisOPs.filter(
        (x) => x.CD_LOCAL == parseInt(this.facIdStatus)
      );
      this.tituloLocal = this.faccaoList[0].DS_LOCAL;

      this.faccaoList.map((x) => {
        x.DT_ENTRADA = `${x.DT_ENTRADA.substring(
          6,
          10
        )}-${x.DT_ENTRADA.substring(3, 5)}-${x.DT_ENTRADA.substring(
          0,
          2
        )}  04:00:00`;
        x.PREV_RETORNO = `${x.PREV_RETORNO.substring(
          6,
          10
        )}-${x.PREV_RETORNO.substring(3, 5)}-${x.PREV_RETORNO.substring(
          0,
          2
        )} 04:00:00`;

        let atraso!: Motivo;
        if (this.motivoList.toString() != 'error') {
          atraso = this.motivoList.filter(
            (_) => _.cod + _.CD_LOCAL == x.cod! + x.CD_LOCAL
          )[0];
        }

        let apontamento!: Apontamento;
        if (this.apontamentoList.toString() != 'error') {
          apontamento = this.apontamentoList.filter(
            (_) => _.cod + _.CD_LOCAL == x.cod! + x.CD_LOCAL
          )[0];
        }

        let hj = new Date();

        let dataEntrada = new Date(x.DT_ENTRADA);
        let dtPrev = new Date(x.PREV_RETORNO);

        x.css_class = dtPrev < hj ? 'atraso' : 'andamento';

        if (!x.DS_COORDENADO) {
          x.DS_COORDENADO = x.DS_GRUPO;
        }
        x['dias_faccao'] = Math.floor(
          (hj.getTime() - dataEntrada.getTime()) / (24 * 3600 * 1000)
        );

        //  verifica se teve atraso para essa OP
        if (atraso) {
          x['motivo_atraso'] = atraso.MOTIVO;
          x['nova_previsao'] = atraso.NOVA_PREVISAO;
        } else {
          x['motivo_atraso'] = '-';
          x['nova_previsao'] = '-';
        }

        //  verifica se teve apontamento para essa OP
        x['apontamento'] = apontamento ? apontamento.Situacao : '-';
      });
    }
  }

  filterOPs(OPList: OPs) {
    let { origem, colecao, apontamentoFilter } = this.selectedFilters;
    let listFilteredOPs = OPList;

    // filtra as ops de acordo com o status filtrado
    if (!!apontamentoFilter && apontamentoFilter != "Não informado") {
      let apCodList = this.apontamentoList.flatMap(
        (ap) => ap.cod + ap.CD_LOCAL
      );
      listFilteredOPs = listFilteredOPs.filter((x) =>
        apCodList.includes(x.cod! + x.CD_LOCAL)
      );
    }else if (apontamentoFilter == "Não informado") {
      let apCodList = this.apontamentoList.flatMap(
        (ap) => ap.cod + ap.CD_LOCAL
      );
      listFilteredOPs = listFilteredOPs.filter((x) =>
        !apCodList.includes(x.cod! + x.CD_LOCAL)
      );
    }

    if (!!origem && !!colecao) {
      listFilteredOPs = listFilteredOPs.filter(
        (x) => x.DS_CLASS == origem && x.DS_CICLO == colecao
      );
    } else if (!!origem && !colecao) {
      listFilteredOPs = listFilteredOPs.filter((x) => x.DS_CLASS == origem);
    } else if (!origem && !!colecao) {
      listFilteredOPs = listFilteredOPs.filter((x) => x.DS_CICLO == colecao);
    }
    return listFilteredOPs;
  }

  // filtra somente os apontamentos com o status filtrado
  filterApontamento(ap: Apontamentos): Apontamentos {
    let { apontamentoFilter } = this.selectedFilters;
    if (!!apontamentoFilter && apontamentoFilter != "Não informado") {
      return ap.filter((a) => a.Situacao! == apontamentoFilter);
    }
    return ap;
  }

  voltar() {
    this._location.back();
  }
}

import { NumberInput } from '@angular/cdk/coercion';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { BehaviorSubject, Subject } from 'rxjs';
import { OPDescricao, OPDescricoes } from 'src/app/models/opdescricao';
import { Motivos } from 'src/app/models/motivo';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { DialogTableComponent } from 'src/app/shared/components/dialog-table/dialog-table.component';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-descricao-status',
  templateUrl: './descricao-status.component.html',
  styleUrls: ['./descricao-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoStatusComponent implements OnDestroy, OnInit {
  // data table variables
  dtOptions: any;
  dtTrigger: Subject<any> = new Subject<any>();

  selectedFilters = {
    origem: '',
    colecao: '',
  };

  color: string[] = ['info', 'warning', 'primary', 'success'];

  origem!: string;
  tituloStatus: string = '';
  isTotal: boolean = false;
  haveOrigem: boolean = false;
  emptyList: boolean = false;
  filtroAtivo: boolean = false;

  listFaccoes: OPs = [];
  codigoList: any[] = [];
  faccaoList: any[] = [];
  motivoList: Motivos = [];
  newMotivoList: Motivos = [];
  faccao: OPDescricoes = [];
  faccao$: BehaviorSubject<OPDescricoes> = new BehaviorSubject(this.faccao);

  dtHoje = new Date();

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private _location: Location,
    private _dialogService: NbDialogService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');
    this.selectedFilters = this._opsFilteredService.getFilter();

    this._auditorService.getMotivos().subscribe((m) => {
      this.motivoList = JSON.parse(m.data);

      this.dtOptions = {
        language: LanguagePtBr.ptBr_datatable,
        pagingType: 'full_numbers',
        pageLength: 15,
        responsive: true,
        processing: true,
        order: [[2, 'desc']],
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
      this.origem = this._route.snapshot.paramMap.get('origem')!;
      this.isTotal = this.tituloStatus == 'Total';
      this.haveOrigem = !!this.origem;

      this._setTitle.setTitle(this.tituloStatus);

      // clicado em total - sem filtro por tipo
      const dataFromSession = this._opsService.getSessionData();
      if (this.isTotal && !this.haveOrigem) {
        if (!!dataFromSession.length) {
          this.startDataTotal(dataFromSession);
        } else {
          this._opsService.getAllOPs().subscribe({
            next: (listOPs) => {
              this.startDataTotal(JSON.parse(listOPs.data));
            },
            error: (err: Error) => {
              console.error(err);
              this._setTitle.setTitle('Erro');
            },
          });
        }
      } else {
        if (!!dataFromSession.length) {
          let filteredOPs = dataFromSession.filter((ops) => {
            if (this.origem) {
              return (
                ops.Status == this.tituloStatus && ops.DS_TIPO == this.origem
              );
            }
            return ops.Status == this.tituloStatus;
          });

          this.startDataFiltered(filteredOPs);
        } else {
          this._opsService
            .getOpByStatus(this.tituloStatus, this.origem)
            .subscribe({
              next: (listOPs) => {
                this.startDataFiltered(JSON.parse(listOPs.data));
              },
              error: (err: Error) => {
                console.error(err);
                this._setTitle.setTitle('Erro');
              },
            });
        }
      }
    });
  }

  startDataTotal(listOPs: OPs) {
    this.listFaccoes = this.filterOPs(listOPs);

    // transforma o cod em uma lista
    this.codigoList = this.listFaccoes.flatMap((x) => x.cod + '-' + x.CD_LOCAL);

    this.motivoList = this.motivoList.filter((m) => {
      let dataAjustada = new Date(m.DT_PREV_RETORNO_NOVA);
      return (
        this.codigoList.includes(m.cod + '-' + m.CD_LOCAL) &&
        dataAjustada >= this.dtHoje
      );
    });

    // chama a funcção de somar os totais de ops e peças
    let {
      nomesUnicos,
      qntOpsLocal,
      qntOpsTotal,
      qntPecasLocal,
      qntPecasTotal,
      qntOpsAtrasoLocal,
      qntOpsAtrasoTotal,
      pecasAtrasoLocal,
      pecasAtrasoTotal,
    } = this.contabilizaTotais();

    let id = 0;
    let motivos = [];

    nomesUnicos.map((f: string, index: number) => {
      id = this.faccaoList.find((x) => x.local == f)?.id_local!;

      if (this.motivoList.toString() != 'error') {
        motivos = this.motivoList.filter((m) => m.CD_LOCAL == id);
      }

      this.faccao.push(
        ...[
          {
            id: id,
            name: f,
            qnt: qntOpsLocal[f],
            qnt_pecas: qntPecasLocal[f],
            qnt_atraso: qntOpsAtrasoLocal[f + '-Em atraso'] || 0,
            pecas_atraso: pecasAtrasoLocal[f + '-Em atraso'] || 0,
            color: '',
            alteracoes: motivos.length,
          },
        ]
      );
    });

    this.faccao.push({
      id: 99999,
      name: 'Geral',
      qnt: qntOpsTotal,
      qnt_pecas: qntPecasTotal,
      qnt_atraso: qntOpsAtrasoTotal,
      pecas_atraso: pecasAtrasoTotal,
      color: '',
      alteracoes: this.motivoList.length,
    });

    this.faccao
      .sort((a, b) => (a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0))
      .map(
        (f: OPDescricao, index: number) =>
          (f.color = this.color[index % this.color.length])
      );

    this.faccao$.next(this.faccao);
    this.dtTrigger.next(this.dtOptions);
  }

  startDataFiltered(listOPs: OPs) {
    this.listFaccoes = this.filterOPs(listOPs);

    // chama a funcção de somar os totais de ops e peças
    let {
      nomesUnicos,
      qntOpsLocal,
      qntOpsTotal,
      qntPecasLocal,
      qntPecasTotal,
      qntOpsAtrasoLocal,
      qntOpsAtrasoTotal,
      pecasAtrasoLocal,
      pecasAtrasoTotal,
    } = this.contabilizaTotais();

    this.codigoList = this.listFaccoes.flatMap((x) => x.cod);

    this.motivoList = this.motivoList.filter((m) =>
      this.codigoList.includes(m.cod)
    );

    let id = 0;
    let motivos: Motivos = [];

    nomesUnicos.map((f: string, index: number) => {
      id = this.faccaoList.find((x) => x.local == f)?.id_local!;
      if (this.motivoList.toString() != 'error') {
        if (this.isTotal) {
          motivos = this.motivoList.filter((m) => m.CD_LOCAL == id);
        } else {
          motivos = this.motivoList.filter(
            (m) => m.CD_LOCAL == id && m.Status_Atual == this.tituloStatus
          );
        }
      }
      // filtra lista de motivos vazios e insere em um novo array
      motivos.forEach((motivo) => {
        if (motivo) {
          this.newMotivoList.push(motivo);
        }
      });

      this.faccao.push(
        ...[
          {
            id: id,
            name: f,
            tipo: this.origem,
            qnt: qntOpsLocal[f],
            qnt_pecas: qntPecasLocal[f],
            qnt_atraso: qntOpsAtrasoLocal[f + '-Em atraso'] || 0,
            pecas_atraso: pecasAtrasoLocal[f + '-Em atraso'] || 0,
            color: '',
            alteracoes: motivos.length,
          },
        ]
      );
    });

    if (this.isTotal) {
      this.faccao.push({
        id: 99999,
        name: 'Geral',
        tipo: this.origem,
        qnt: qntOpsTotal,
        qnt_pecas: qntPecasTotal,
        qnt_atraso: qntOpsAtrasoTotal,
        pecas_atraso: pecasAtrasoTotal,
        color: '',
        alteracoes: this.newMotivoList.length,
      });
    } else {
      this.faccao.push({
        id: 99999,
        name: 'Geral',
        tipo: this.origem,
        qnt: qntOpsTotal,
        qnt_pecas: qntPecasTotal,
        color: '',
        alteracoes: this.newMotivoList.filter(
          (m) => m.Status_Atual == this.tituloStatus
        ).length,
      });
    }

    this.faccao
      .sort((a, b) => (a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0))
      .map(
        (f: OPDescricao, index: number) =>
          (f.color = this.color[index % this.color.length])
      );

    this.faccao$.next(this.faccao);
    this.dtTrigger.next(this.dtOptions);
  }

  openAtraso(id: NumberInput, name: string) {
    let geral = id == 99999;
    let alteracoes;
    if (this.isTotal) {
      alteracoes = this.motivoList;
      if (!geral) {
        alteracoes = this.motivoList.filter((m) => m.CD_LOCAL == id);
      }
    } else {
      alteracoes = this.newMotivoList.filter(
        (m) => m.Status_Atual == this.tituloStatus
      );
      if (!geral) {
        alteracoes = this.newMotivoList.filter(
          (m) => m.CD_LOCAL == id && m.Status_Atual == this.tituloStatus
        );
      }
    }

    this._dialogService.open(DialogTableComponent, {
      context: {
        motivos: alteracoes,
        status: this.tituloStatus,
        name: name,
      },
      hasScroll: true,
    });
  }

  contabilizaTotais() {
    this.listFaccoes.forEach((x) => {
      this.faccaoList.push({
        id_local: x['CD_LOCAL'],
        origem: x['DS_TIPO'],
        local: x['DS_LOCAL'],
        status: x['Status'],
        qnt_p: x['QT_OP'],
      });
    });

    // pega a lista de id_local únicos
    let uniq = this.faccaoList.flatMap((x) => x.local);
    uniq = [...new Set(uniq)].filter((item) => item !== '');

    // conta ops por local
    let qnt_ops = this.faccaoList.reduce((prev, cur) => {
      prev[cur.local] = (prev[cur.local] || 0) + 1;
      return prev;
    }, {});

    // soma o total de ops
    let qnt_ops_total = 0;
    for (var key in qnt_ops) {
      qnt_ops_total += qnt_ops[key];
    }

    // conta peças
    let qnt_pecas = this.faccaoList.reduce((prev, cur) => {
      prev[cur.local] = (prev[cur.local] || 0) + parseInt(cur.qnt_p);
      return prev;
    }, {});

    // soma o total de peças
    let qnt_pecas_total = 0;
    for (var key in qnt_pecas) {
      qnt_pecas_total += qnt_pecas[key];
    }

    // conta peças em atraso
    let ops_at = this.faccaoList.reduce((prev, cur) => {
      prev[cur.local + '-' + cur.status] =
        (prev[cur.local + '-' + cur.status] || 0) + 1;
      return prev;
    }, {});

    // soma o total de peças em atraso
    let ops_at_total = 0;
    for (var key in ops_at) {
      if (key.includes('-Em atraso')) {
        ops_at_total += ops_at[key];
      }
    }

    // conta peças em atraso
    let pecas_at = this.faccaoList.reduce((prev, cur) => {
      prev[cur.local + '-' + cur.status] =
        (prev[cur.local + '-' + cur.status] || 0) + parseInt(cur.qnt_p);
      return prev;
    }, {});

    // soma o total de peças em atraso
    let pecas_at_total = 0;
    for (var key in pecas_at) {
      if (key.includes('-Em atraso')) {
        pecas_at_total += pecas_at[key];
      }
    }

    return {
      nomesUnicos: uniq,
      qntOpsLocal: qnt_ops,
      qntOpsTotal: qnt_ops_total,
      qntPecasLocal: qnt_pecas,
      qntPecasTotal: qnt_pecas_total,
      qntOpsAtrasoLocal: ops_at,
      qntOpsAtrasoTotal: ops_at_total,
      pecasAtrasoLocal: pecas_at,
      pecasAtrasoTotal: pecas_at_total,
    };
  }

  filterOPs(OPList: OPs) {
    let { origem, colecao } = this.selectedFilters;
    let listFilteredOPs = OPList;

    let hasOrigem = origem.length > 0;
    let hasColecao = colecao.length > 0;

    if (hasOrigem && hasColecao) {
      listFilteredOPs = OPList.filter(
        (x) => origem.includes(x.DS_CLASS) && colecao.includes(x.NR_CICLO+'')
      );
    } else if (hasOrigem && !hasColecao) {
      listFilteredOPs = OPList.filter((x) => origem.includes(x.DS_CLASS));
    } else if (!hasOrigem && hasColecao) {
      listFilteredOPs = OPList.filter((x) => colecao.includes(x.NR_CICLO+''));
    }
    return listFilteredOPs;
  }

  trackByFaccao(_index: number, faccao: OPDescricao) {
    return faccao.id;
  }

  voltar() {
    this._location.back();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}

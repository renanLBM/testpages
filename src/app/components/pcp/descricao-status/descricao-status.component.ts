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
import { Faccao, Faccoes } from 'src/app/models/faccao';
import { Motivos } from 'src/app/models/motivo';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
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
  dtOptions: any;
  dtTrigger: Subject<any> = new Subject<any>();

  origem!: string;
  tituloStatus: string = '';
  emptyList: boolean = false;
  filtroAtivo: boolean = false;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  listFaccoes: OPs = [];
  codigoList: any[] = [];
  faccaoList: any[] = [];
  motivoList: Motivos = [];
  newMotivoList: Motivos = [];
  faccao: Faccoes = [];
  faccao$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.faccao);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private _location: Location,
    private NbDdialogService: NbDialogService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');

    this._auditorService.getMotivos().subscribe((m) => {
      this.motivoList = m;

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

      this._setTitle.setTitle(this.tituloStatus);

      // clicado em total - sem filtro por tipo
      if (this.tituloStatus == 'Total' && !this.origem) {
        this._opsService.getAllOPs().subscribe({
          next: (o) => {
            this.listFaccoes = o;
            // transforma o cod em uma lista
            this.codigoList = this.listFaccoes.flatMap((x) => x.cod);

            this.motivoList = this.motivoList.filter((m) =>
              this.codigoList.includes(m.cod)
            );

            // chama a funcção de somar os totais de ops e peças
            let {
              nomesUnicos,
              qntOpsLocal,
              qntOpsTotal,
              qntPecasLocal,
              qntPecasTotal,
              qntOpsAtrasoLocal,
              qntOpsAtrasolTotal,
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
                    qnt_pecas: parseInt(qntPecasLocal[f]).toLocaleString(
                      'pt-Br'
                    ),
                    qnt_atraso: qntOpsAtrasoLocal[f + '-Em atraso'] || 0,
                    pecas_atraso: parseInt(
                      pecasAtrasoLocal[f + '-Em atraso'] || 0
                    ).toLocaleString('pt-Br'),
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
              qnt_pecas: qntPecasTotal.toLocaleString('pt-Br'),
              qnt_atraso: qntOpsAtrasolTotal.toLocaleString('pt-Br'),
              pecas_atraso: pecasAtrasoTotal.toLocaleString('pt-Br'),
              color: '',
              alteracoes: this.motivoList.length,
            });

            this.faccao
              .sort((a, b) => (a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0))
              .map(
                (f: Faccao, index: number) =>
                  (f.color = this.color[index % this.color.length])
              );

            this.faccao$.next(this.faccao);
            this.dtTrigger.next(this.dtOptions);
          },
          error: (err: Error) => {
            console.error(err);
            this._setTitle.setTitle('Erro');
          },
        });
      } else {
        this._opsService
          .getOpByStatus(this.tituloStatus, this.origem)
          .subscribe({
            next: (list) => {
              this.listFaccoes = list;
              this.codigoList = this.listFaccoes.flatMap((x) => x.cod);

              // chama a funcção de somar os totais de ops e peças
              let {
                nomesUnicos,
                qntOpsLocal,
                qntOpsTotal,
                qntPecasLocal,
                qntPecasTotal,
                pecasAtrasoLocal,
                pecasAtrasoTotal,
              } = this.contabilizaTotais();

              let id = 0;
              let motivos: Motivos = [];

              let idList: any[] = [];
              this.faccaoList.forEach((x) => idList.push(x.id_local));
              // this.motivoList = this.motivoList.filter(
              //   (ob) => !idList.includes(ob.CD_LOCAL)
              // );

              nomesUnicos.map((f: string, index: number) => {
                id = this.faccaoList.find((x) => x.local == f)?.id_local!;
                if (this.motivoList.toString() != 'error') {
                  if (this.tituloStatus == 'Total') {
                    motivos = this.motivoList.filter((m) => m.CD_LOCAL == id);
                  } else {
                    motivos = this.motivoList.filter(
                      (m) =>
                        m.CD_LOCAL == id && m.Status_Atual == this.tituloStatus
                    );
                  }
                }
                // filtra lista de motivos vazios e insere em um novo array
                if (motivos[0]) {
                  this.newMotivoList.push(motivos[0]);
                }

                this.faccao.push(
                  ...[
                    {
                      id: id,
                      name: f,
                      qnt: qntOpsLocal[f],
                      qnt_pecas: parseInt(qntPecasLocal[f]).toLocaleString(
                        'pt-Br'
                      ),
                      qnt_atraso: this.faccaoList
                        .filter(
                          (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
                        )
                        .length.toLocaleString(),
                      pecas_atraso: parseInt(
                        pecasAtrasoLocal[f + '-Em atraso'] || 0
                      ).toLocaleString('pt-Br'),
                      color: '',
                      alteracoes: motivos.length,
                    },
                  ]
                );
              });

              if (this.tituloStatus == 'Total') {
                this.faccao.push({
                  id: 99999,
                  name: 'Geral',
                  qnt: qntOpsTotal,
                  qnt_pecas: qntPecasTotal.toLocaleString('pt-Br'),
                  qnt_atraso: this.faccaoList
                    .filter((op) => op.Status == 'Em atraso')
                    .length.toLocaleString(),
                  pecas_atraso: pecasAtrasoTotal.toLocaleString('pt-Br'),
                  color: '',
                  alteracoes: this.newMotivoList.length,
                });
              } else {
                this.faccao.push({
                  id: 99999,
                  name: 'Geral',
                  qnt: qntOpsTotal,
                  qnt_pecas: qntPecasTotal.toLocaleString('pt-Br'),
                  color: '',
                  alteracoes: this.newMotivoList.filter(
                    (m) => m.Status_Atual == this.tituloStatus
                  ).length,
                });
              }

              this.faccao
                .sort((a, b) => (a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0))
                .map(
                  (f: Faccao, index: number) =>
                    (f.color = this.color[index % this.color.length])
                );

              this.faccao$.next(this.faccao);
              this.dtTrigger.next(this.dtOptions);
            },
            error: (err: Error) => {
              console.error(err);
              this._setTitle.setTitle('Erro');
            },
          });
      }
    });
  }

  openAtraso(id: NumberInput, name: string) {
    let geral = id == 99999;
    let alteracoes;
    if (this.tituloStatus == 'Total') {
      alteracoes = this.motivoList;
      console.log(id);
      console.log(this.codigoList.includes('1531'));
      console.log(this.newMotivoList);
      if (!geral) {
        alteracoes = this.newMotivoList.filter(
          (m) => this.codigoList.includes(m.cod) && m.CD_LOCAL == id
        );
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
    this.NbDdialogService.open(DialogTableComponent, {
      context: {
        motivos: alteracoes,
        status: this.tituloStatus,
        name: name,
      },
    });
  }

  contabilizaTotais() {
    this.listFaccoes.forEach((x) => {
      this.faccaoList.push({
        id_local: x['CD_LOCAL'],
        origen: x['DS_TIPO'],
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
      qntOpsAtrasolTotal: ops_at_total,
      pecasAtrasoLocal: pecas_at,
      pecasAtrasoTotal: pecas_at_total,
    };
  }

  trackByFaccao(_index: number, faccao: Faccao) {
    return faccao.id;
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  voltar() {
    this._location.back();
  }
}

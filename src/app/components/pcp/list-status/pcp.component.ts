import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccoes } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

type NbComponentStatus =
  | 'basic'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'control';

interface TipoPorStatus {
  status?: string;
  qnt_total?: number;
  pecas_total?: number;
  tipo?: Faccoes;
  colorAccent?: NbComponentStatus;
}

@Component({
  selector: 'fc-pcp',
  templateUrl: './pcp.component.html',
  styleUrls: ['./pcp.component.scss'],
})
export class PcpComponent implements OnInit {
  color: string[] = ['warning', 'info', 'success', 'danger', 'primary'];
  menuOrigem: string[] = [];
  menuColecao: string[] = [];

  listStatus!: OPs;
  tipoList: any[] = [];
  uniqTipo: any[] = [];
  uniqStatus: any[] = [];
  OpList: Faccoes = [];
  OpList$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.OpList);
  OpTipoList: Faccoes = [];

  statusTipo: TipoPorStatus[] = [
    {
      status: 'Total',
      colorAccent: 'info',
    },
    {
      status: 'Em andamento',
      colorAccent: 'success',
    },
    {
      status: 'Em atraso',
      colorAccent: 'danger',
    },
  ];
  statusTipo$: BehaviorSubject<TipoPorStatus[]> = new BehaviorSubject(
    this.statusTipo
  );

  constructor(
    private _setTitle: SetTitleServiceService,
    public _loadingService: LoadingService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('PCP');
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.listStatus = list;

        this.listStatus.forEach((x) => {
          this.menuOrigem.push(x.DS_CLASS);
          this.menuOrigem = [...new Set(this.menuOrigem)];

          this.menuColecao.push(x.DS_DROP);
          this.menuColecao = [...new Set(this.menuColecao)];

          this.menuColecao.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

          this.tipoList.push({
            // tipo: x['DS_CLASS'].replace(' - PRIVATE LABEL', ''),
            tipo: x['DS_TIPO'],
            status: x['Status'],
            qnt_p: x['QT_OP'],
          });
        });
        this.listStatus.forEach((x) => {
          this.tipoList.push({
            tipo: 'Total',
            status: x['Status'],
            qnt_p: x['QT_OP'],
          });
        });

        // set unique type
        this.tipoList.forEach((f) => {
          this.uniqTipo.push(f.tipo + '-' + f.status);
          this.uniqTipo = [...new Set(this.uniqTipo)].filter(
            (item) => item !== ''
          );
        });
        // set unique status
        this.tipoList.forEach((f) => {
          this.uniqStatus.push(f.status);
          this.uniqStatus = [...new Set(this.uniqStatus)].filter(
            (item) => item !== ''
          );
        });

        let qntOpsStatus = this.tipoList
          .filter((tl) => tl.tipo == 'Total')
          .reduce((prev, cur) => {
            prev[cur.status] = (prev[cur.status] || 0) + 1;
            return prev;
          }, {});
        let qntPecasStatus = this.tipoList
          .filter((tl) => tl.tipo == 'Total')
          .reduce((prev, cur) => {
            prev[cur.status] = (prev[cur.status] || 0) + parseInt(cur.qnt_p);
            return prev;
          }, {});
        let totalOpsStatus = this.tipoList
          .filter((tl) => tl.tipo == 'Total')
          .reduce((prev, cur) => {
            prev[cur.tipo] = (prev[cur.tipo] || 0) + 1;
            return prev;
          }, {});
        let totalPecasStatus = this.tipoList
          .filter((tl) => tl.tipo == 'Total')
          .reduce((prev, cur) => {
            prev[cur.tipo] = (prev[cur.tipo] || 0) + parseInt(cur.qnt_p);
            return prev;
          }, {});

        this.uniqStatus.map((s: string, index: number) => {
          this.OpList.push({
            name: s,
            qnt: qntOpsStatus[s],
            qnt_pecas: parseInt(qntPecasStatus[s]).toLocaleString('pt-Br'),
          });
          s;
        });
        this.OpList.push({
          name: 'Total',
          qnt: totalOpsStatus['Total'],
          qnt_pecas: parseInt(totalPecasStatus['Total']).toLocaleString(
            'pt-Br'
          ),
        });

        this.OpList.map((op) => {
          if (op.name == 'Em andamento') {
            op.color = 'success';
          } else if (op.name == 'Pendente') {
            op.color = 'warning';
          } else if (op.name == 'Em atraso') {
            op.color = 'danger';
          } else {
            op.color = 'primary';
          }
        });

        this.OpList.sort((a, b) =>
          a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
        );

        let qntTotalPecasTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo] = (prev[cur.tipo] || 0) + parseInt(cur.qnt_p);
          return prev;
        }, {});
        let qntTotalOpsTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo] = (prev[cur.tipo] || 0) + 1;
          return prev;
        }, {});
        let qntPecasTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo + '-' + cur.status] =
            (prev[cur.tipo + '-' + cur.status] || 0) + parseInt(cur.qnt_p);
          return prev;
        }, {});
        let qntOpsTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo + '-' + cur.status] =
            (prev[cur.tipo + '-' + cur.status] || 0) + 1;
          return prev;
        }, {});

        let objectArray = Object.keys(qntTotalPecasTipo).map((key) => [
          key,
          qntTotalPecasTipo[key],
        ]);
        for (let i of objectArray) {
          if (i[0] != 'Total') {
            this.OpTipoList.push(
              ...[
                {
                  name: i[0],
                  qnt: qntTotalOpsTipo[i[0]],
                  status: 'Total',
                  qnt_pecas: i[1],
                },
              ]
            );
          }
        }
        this.uniqTipo.map((s: string, index: number) => {
          if (s.split('-')[0] != 'Total') {
            this.OpTipoList.push(
              ...[
                {
                  name: s.split('-')[0],
                  qnt: qntOpsTipo[s],
                  status: s.split('-')[1],
                  qnt_pecas: qntPecasTipo[s],
                },
              ]
            );
          }
        });

        this.OpTipoList.sort((a, b) =>
          +a.qnt_pecas! < +b.qnt_pecas!
            ? 1
            : +b.qnt_pecas! < +a.qnt_pecas!
            ? -1
            : 0
        );

        this.statusTipo.forEach((s) => {
          let tmpOP: Faccoes = [];
          this.OpTipoList.filter((n) => n.status?.includes(s.status!)).forEach(
            (op) => {
              tmpOP.push(op);
            }
          );
          let idx = this.statusTipo.findIndex((st) => st.status == s.status);
          this.statusTipo[idx] = {
            status: this.statusTipo[idx].status,
            tipo: tmpOP,
            colorAccent: this.statusTipo[idx].colorAccent,
          };
        });

        this.statusTipo$.next(this.statusTipo);
        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }
}

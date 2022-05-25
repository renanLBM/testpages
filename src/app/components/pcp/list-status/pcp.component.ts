import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccao } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-pcp',
  templateUrl: './pcp.component.html',
  styleUrls: ['./pcp.component.scss'],
})
export class PcpComponent implements OnInit {
  color: string[] = ['warning', 'info', 'success', 'danger', 'primary'];

  listStatus: OPs = [];
  tipoList: any[] = [];
  uniqTipo: any[] = [];
  uniqStatus: any[] = [];
  OpTipoList: Faccao[] = [];
  OpList: Faccao[] = [];
  OpList$: BehaviorSubject<Faccao[]> = new BehaviorSubject(this.OpList);
  OpTipoList$: BehaviorSubject<Faccao[]> = new BehaviorSubject(this.OpTipoList);

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

        // Tipo
        this.listStatus.forEach((x) => {
          this.tipoList.push({ tipo: x['DS_TIPO'], status: x['Status'], qnt_p: x['QT_OP'] });
        });
        this.listStatus.forEach((x) => {
          this.tipoList.push({tipo: 'Total', status: 'Total', qnt_p: x['QT_OP'] });
        });

        this.tipoList.forEach((f) => {
          this.uniqTipo.push(f.tipo);
          this.uniqTipo = [...new Set(this.uniqTipo)].filter((item) => item !== '');
        });

        let qntOpsTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo] = (prev[cur.tipo] || 0) + 1;
          return prev;
        }, {});
        let qntPecasTipo = this.tipoList.reduce((prev, cur) => {
          prev[cur.tipo] = (prev[cur.tipo] || 0) + parseInt(cur.qnt_p);
          return prev;
        }, {});

        this.tipoList.forEach((f) => {
          this.uniqStatus.push(f.status);
          this.uniqStatus = [...new Set(this.uniqStatus)].filter((item) => item !== '');
        });
        let qntOpsStatus = this.tipoList.reduce((prev, cur) => {
          prev[cur.status] = (prev[cur.status] || 0) + 1;
          return prev;
        }, {});
        let qntPecasStatus = this.tipoList.reduce((prev, cur) => {
          prev[cur.status] = (prev[cur.status] || 0) + parseInt(cur.qnt_p);
          return prev;
        }, {});

        this.uniqStatus.map((s: string, index: number) => {
          this.OpList.push(
            ...[
              {
                name: s,
                tipos: qntOpsTipo[s],
                qnt_pecas_tipo: qntPecasTipo[s],
                qnt: qntOpsStatus[s],
                status: qntOpsStatus[s],
                qnt_pecas: parseInt(qntPecasStatus[s]).toLocaleString('pt-Br'),
              },
            ]
          );
        });

        this.uniqTipo.map((s: string, index: number) => {
          this.OpTipoList.push(
            ...[
              {
                name: s,
                tipos: qntOpsTipo[s],
                qnt_pecas_tipo: qntPecasTipo[s],
                qnt: qntOpsStatus[s],
                status: qntOpsStatus[s],
                qnt_pecas: parseInt(qntPecasStatus[s]).toLocaleString('pt-Br'),
              },
            ]
          );
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
        this.OpTipoList.sort((a, b) =>
          a.tipos! < b.tipos! ? 1 : b.tipos! < a.tipos! ? -1 : 0
        );

        this.OpTipoList$.next(this.OpTipoList);
        this.OpList$.next(this.OpList);

        // ----------------------------- Tipo End


        // // Status
        // this.listStatus.forEach((x) => {
        //   this.OpsList.push({ status: x['Status'], qnt_p: x['QT_OP'] });
        // });
        // this.listStatus.forEach((x) => {
        //   this.OpsList.push({ status: 'Geral', qnt_p: x['QT_OP'] });
        // });

        // let uniq: any[] = [];
        // this.OpsList.forEach((f) => {
        //   uniq.push(f.status);
        //   uniq = [...new Set(uniq)].filter((item) => item !== '');
        // });

        // let qntOps = this.OpsList.reduce((prev, cur) => {
        //   prev[cur.status] = (prev[cur.status] || 0) + 1;
        //   return prev;
        // }, {});
        // let qntPecas = this.OpsList.reduce((prev, cur) => {
        //   prev[cur.status] = (prev[cur.status] || 0) + parseInt(cur.qnt_p);
        //   return prev;
        // }, {});

        // uniq.map((s: string, index: number) => {
        //   this.OpList.push(
        //     ...[
        //       {
        //         name: s,
        //         qnt: qntOps[s],
        //         qntPecas: parseInt(qntPecas[s]).toLocaleString('pt-Br'),
        //       },
        //     ]
        //   );
        // });

        // this.OpList.map((op) => {
        //   if (op.name == 'Em andamento') {
        //     op.color = 'success';
        //   } else if (op.name == 'Pendente') {
        //     op.color = 'warning';
        //   } else if (op.name == 'Em atraso') {
        //     op.color = 'danger';
        //   } else {
        //     op.color = 'primary';
        //   }
        // });

        // this.OpList.sort((a, b) =>
        //   a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
        // );

        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }
}

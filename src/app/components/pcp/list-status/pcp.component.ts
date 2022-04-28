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
  styleUrls: ['./pcp.component.scss']
})
export class PcpComponent implements OnInit {

  color: string[] = ['warning', 'info', 'success', 'danger', 'primary'];

  listStatus: OPs = [];
  OpsList: any[] = [];
  OpList: Faccao[] = [];
  OpList$: BehaviorSubject<Faccao[]> = new BehaviorSubject(this.OpList);

  constructor(
    private _setTitle: SetTitleServiceService,
    public _loadingService: LoadingService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle("FacControl - PCP");
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.listStatus = list;

        this.listStatus.forEach((x) => {
          this.OpsList.push({ status: x['Status'], qnt_p: x['QT_OP'] });
        });
        this.listStatus.forEach((x) => {
          this.OpsList.push({ status: 'Geral', qnt_p: x['QT_OP'] });
        });

        let uniq: any[] = [];
        this.OpsList.forEach((f) => {
          uniq.push(f.status);
          uniq = [...new Set(uniq)].filter((item) => item !== '');
        });

        let qnt_ops = this.OpsList.reduce((prev, cur) => {
          prev[cur.status] = (prev[cur.status] || 0) + 1;
          return prev;
        }, {});
        let qnt_pecas = this.OpsList.reduce((prev, cur) => {
          prev[cur.status] = (prev[cur.status] || 0) + parseInt(cur.qnt_p);
          return prev;
        }, {});

        uniq.map((s: string, index: number) => {
          this.OpList.push(
            ...[
              {
                name: s,
                qnt: qnt_ops[s],
                qnt_pecas: parseInt(qnt_pecas[s]).toLocaleString('pt-Br')
              },
            ]
          );
        });

        this.OpList.map( (op) => {
          if (op.name == "Em andamento") {
            op.color = 'success';
          } else if (op.name == "Pendente") {
            op.color = 'warning';
          } else if ( op.name == 'Em atraso') {
            op.color = 'danger'
          } else {
            op.color = 'primary'
          }
        })

        this.OpList.sort((a, b) =>
          a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
        );

        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }
}

import { NumberInput } from '@angular/cdk/coercion';
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
import { DialogTableOpComponent } from 'src/app/shared/components/dialog-table-op/dialog-table-op.component';
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

  tituloStatus: string = '';
  emptyList: boolean = false;
  filtroAtivo: boolean = false;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  listFaccoes: OPs = [];
  faccaoList: any[] = [];
  motivoList: Motivos = [];
  faccao: Faccoes = [];
  faccao$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.faccao);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    public _loadingService: LoadingService,
    private NbDdialogService: NbDialogService
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
      this._setTitle.setTitle(this.tituloStatus);

      if (this.tituloStatus == 'Geral') {
        this._opsService.getAllOPs().subscribe({
          next: (o) => {
            this.listFaccoes = o;

            this.listFaccoes.forEach((x) => {
              this.faccaoList.push({
                local: x['DS_LOCAL'],
                qnt_p: x['QT_OP'],
                status: x['Status'],
              });
            });

            let uniq: any[] = [];
            this.faccaoList.forEach((f) => {
              uniq.push(f.local);
              uniq = [...new Set(uniq)].filter((item) => item !== '');
            });

            // conta ops
            let qnt_ops = this.faccaoList.reduce((prev, cur) => {
              prev[cur.local] = (prev[cur.local] || 0) + 1;
              return prev;
            }, {});
            // conta peças
            let qnt_pecas = this.faccaoList.reduce((prev, cur) => {
              prev[cur.local] = (prev[cur.local] || 0) + parseInt(cur.qnt_p);
              return prev;
            }, {});
            // conta peças em atraso
            let pecas_at = this.faccaoList.reduce((prev, cur) => {
              prev[cur.local + '-' + cur.status] =
                (prev[cur.local + '-' + cur.status] || 0) + parseInt(cur.qnt_p);
              return prev;
            }, {});

            let id = 0;
            let motivos = [];

            uniq.map((f: string, index: number) => {
              id = this.listFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;
              motivos = this.motivoList.filter((m) => m.CD_LOCAL == id);

              this.faccao.push(
                ...[
                  {
                    id: id,
                    name: f,
                    qnt: qnt_ops[f],
                    qnt_pecas: parseInt(qnt_pecas[f]).toLocaleString('pt-Br'),
                    qnt_atraso: this.listFaccoes
                      .filter(
                        (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
                      )
                      .length.toLocaleString(),
                    pecas_atraso: parseInt(
                      pecas_at[f + '-Em atraso'] || 0
                    ).toLocaleString('pt-Br'),
                    color: '',
                    alteracoes: motivos.length,
                  },
                ]
              );
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
        this._opsService.getOpByStatus(this.tituloStatus).subscribe({
          next: (list) => {
            this.listFaccoes = list;

            this.listFaccoes.forEach((x) => {
              this.faccaoList.push({ local: x['DS_LOCAL'], qnt_p: x['QT_OP'] });
            });

            let uniq: any[] = [];
            this.faccaoList.forEach((f) => {
              uniq.push(f.local);
              uniq = [...new Set(uniq)].filter((item) => item !== '');
            });

            let qnt_ops = this.faccaoList.reduce((prev, cur) => {
              prev[cur.local] = (prev[cur.local] || 0) + 1;
              return prev;
            }, {});
            let qnt_pecas = this.faccaoList.reduce((prev, cur) => {
              prev[cur.local] = (prev[cur.local] || 0) + parseInt(cur.qnt_p);
              return prev;
            }, {});

            let id = 0;
            let motivos = [];

            uniq.map((f: string, index: number) => {
              id = this.listFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;
              motivos = this.motivoList.filter(
                (m) => m.CD_LOCAL == id && m.Status == this.tituloStatus
              );

              this.faccao.push(
                ...[
                  {
                    id: id,
                    name: f,
                    qnt: qnt_ops[f],
                    qnt_pecas: parseInt(qnt_pecas[f]).toLocaleString('pt-Br'),
                    qnt_atraso: this.listFaccoes
                      .filter(
                        (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
                      )
                      .length.toLocaleString(),
                    color: '',
                    alteracoes: motivos.length,
                  },
                ]
              );
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
      }
    });
  }

  trackByFaccao(_index: number, faccao: Faccao) {
    return faccao.id;
  }

  openAtraso(id: NumberInput, name: string) {
    let alteracoes;
    if (this.tituloStatus == 'Geral') {
      alteracoes = this.motivoList.filter((m) => m.CD_LOCAL == id);
    } else {
      alteracoes = this.motivoList.filter(
        (m) => m.CD_LOCAL == id && m.Status == this.tituloStatus
      );
    }
    this.NbDdialogService.open(DialogTableComponent, {
      context: {
        motivos: alteracoes,
        status: this.tituloStatus,
        name: name,
      },
    });
  }

  openOps(id: NumberInput, name: string) {
    let alteracoes = this.motivoList.filter(
      (m) => m.CD_LOCAL == id && m.Status == this.tituloStatus
    );
    let ops = this.listFaccoes.filter(
      (m) => m.CD_LOCAL == id && m.Status == this.tituloStatus
    );
    this.NbDdialogService.open(DialogTableOpComponent, {
      context: {
        ops: ops,
        motivos: alteracoes,
        status: this.tituloStatus,
        name: name,
      },
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

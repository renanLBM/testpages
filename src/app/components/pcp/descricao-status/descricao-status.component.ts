import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Faccao, Faccoes } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-descricao-status',
  templateUrl: './descricao-status.component.html',
  styleUrls: ['./descricao-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoStatusComponent implements OnDestroy, OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  tituloStatus: string = '';
  emptyList: boolean = false;
  filtroAtivo: boolean = false;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  listFaccoes: OPs = [];
  faccaoList: any[] = [];
  faccao: Faccoes = [];
  faccao$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.faccao);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _route: ActivatedRoute,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');

    this.dtOptions = {
      language: LanguagePtBr.ptBr_datatable,
      pagingType: 'full_numbers',
      pageLength: 25,
      autoWidth: true,
      responsive: true
    };

    this.tituloStatus = this._route.snapshot.paramMap.get('status')!;
    this._setTitle.setTitle(this.tituloStatus);
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

        uniq.map((f: string, index: number) => {
          id = this.listFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;

          this.faccao.push(
            ...[
              {
                id: id,
                name: f,
                qnt: qnt_ops[f],
                qnt_pecas: qnt_pecas[f],
                qnt_atraso: this.listFaccoes.filter(
                  (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
                ).length,
                color: '',
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

  trackByFaccao(_index: number, faccao: Faccao) {
    return faccao.id;
  }

  filtroFaccao(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue == '') {
      this.filtroAtivo = false;
      this.faccao$.next(this.faccao);
    } else {
      this.filtroAtivo = true;
      this.faccao$.next(
        this.faccao.filter((_) => _.name.includes(filterValue.toUpperCase()))
      );
      this.faccao$.subscribe((x) => (this.emptyList = !x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.faccao$.next(this.faccao);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

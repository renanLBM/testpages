import { Component, OnInit } from '@angular/core';
import { OPs } from 'src/app/models/ops';
import { OpsService } from 'src/app/services/ops.service';
import { BehaviorSubject } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { Faccao } from 'src/app/models/faccao';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-list-faccao',
  templateUrl: './list-faccao.component.html',
  styleUrls: ['./list-faccao.component.scss'],
})
export class ListFaccaoComponent implements OnInit {
  emptyList: boolean = false;
  filtroAtivo: boolean = false;
  show_desc: boolean = true;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  listFaccoes: OPs = [];
  OpsList: any[] = [];
  OpList: Faccao[] = [];
  OpList$: BehaviorSubject<Faccao[]> = new BehaviorSubject(this.OpList);

  constructor(
    public _loadingService: LoadingService,
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Auditor');
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.listFaccoes = list;

        this.listFaccoes.forEach((x) => {
          this.OpsList.push(x['DS_LOCAL']);
        });

        let uniq = [...new Set(this.OpsList)].filter((item) => item !== '');

        let qnt = this.OpsList.reduce((prev, cur) => {
          prev[cur] = (prev[cur] || 0) + 1;
          return prev;
        }, {});

        let id = 0;
        let atraso = 0;
        let per_atraso = 0;
        let cor = '';

        uniq.map((f: string, index: number) => {
          id = this.listFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;
          atraso = this.listFaccoes.filter(
            (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
          ).length;
          per_atraso = (atraso/qnt[f]);

          if (per_atraso >= 0.5){
            cor = 'danger';
          } else if (per_atraso >= 0.01){
            cor = 'warning';
          }else {
            cor = 'info';
          }

          this.OpList.push(
            ...[
              {
                id: id,
                name: f,
                qnt: qnt[f],
                qnt_atraso: atraso.toLocaleString('pt-Br'),
                per_atraso: Math.floor(per_atraso * 100),
                color: cor,
              },
            ]
          );
        });

        this.OpList.sort((a, b) =>
          a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
        );
        // .map((f: Faccao, index: number) => f.color = this.color[index % this.color.length])

        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }

  filtroFaccao(event: Event): void {
    document.getElementById('filtro')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
    if (!filterValue) {
      this.OpList$.next(this.OpList);
      this.filtroAtivo = false;
    } else {
      this.filtroAtivo = true;
      this.OpList$.next(
        this.OpList.filter((_) => _.name.includes(filterValue.toUpperCase()))
      );
      this.OpList$.subscribe((x) => (this.emptyList = !x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.OpList$.next(this.OpList);
  }
}

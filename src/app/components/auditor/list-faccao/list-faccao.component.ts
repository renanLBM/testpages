import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pages } from 'src/app/models/enums/enumPages';
import { OPDescricoes } from 'src/app/models/opdescricao';
import { OPs } from 'src/app/models/ops';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-list-faccao',
  templateUrl: './list-faccao.component.html',
  styleUrls: ['./list-faccao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFaccaoComponent implements OnInit {
  selectedColecao: string[] = [];
  menuColecao: string[] = [];
  selectedFilters = {
    origem: '',
    colecao: this.selectedColecao,
    apontamentoFilter: '',
  };

  loading = new BehaviorSubject<boolean>(true);
  emptyList = new BehaviorSubject<boolean>(false);
  filtroAtivo: boolean = false;
  show_desc: boolean = true;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  localList: any[] = [];
  AllOpsList: OPs = [];
  AllOpsList2: OPs = [];
  faccaoList: OPDescricoes = [];
  faccaoList$: BehaviorSubject<OPDescricoes> = new BehaviorSubject(
    this.faccaoList
  );

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.selectedFilters = {
      origem: '',
      colecao: [],
      apontamentoFilter: '',
    };

    let nivel =
      this._userService.getNivel() == 99 ? 1 : this._userService.getNivel();
    let titulo = Pages[nivel].charAt(0).toUpperCase() + Pages[nivel].slice(1);

    this._opsFilteredService.setFilter(this.selectedFilters);

    this._setTitle.setTitle('Carregando...');

    this._opsService.getOPsRegiao().subscribe({
      next: (list) => {
        this.AllOpsList = JSON.parse(list.data);
        this.setfaccaolist(this.AllOpsList);

        this.faccaoList.forEach((x) => {
          this.menuColecao.push(x.ciclo + '-' + x.colecao!);
          x['name'] = x['name'].replace('EXT. ', '');
        });

        this.menuColecao = [...new Set(this.menuColecao)];
        this.menuColecao.sort((a, b) =>
          +a.split('-')[0] > +b.split('-')[0] ? 1 :
          +b.split('-')[0] > +a.split('-')[0] ? -1 : 0
        );

        this.faccaoList$.next(this.faccaoList);
        this._setTitle.setTitle(titulo);
        this.loading.next(false);
        this.emptyList.next(!this.faccaoList.length);
      },
      error: (err: Error) => {
        console.error(err);
        this.loading.next(false);
        this.emptyList.next(!this.faccaoList.length);
      },
    });
  }

  setfaccaolist(listaFaccoes: OPs) {
    this.faccaoList = [];
    this.localList = listaFaccoes.flatMap((x) => x.DS_LOCAL);

    let uniq = [...new Set(this.localList)].filter((item) => item !== '');

    let qnt = this.localList.reduce((prev, cur) => {
      prev[cur] = (prev[cur] || 0) + 1;
      return prev;
    }, {});

    let id = 0;
    let atraso = 0;
    let per_atraso = 0;
    let cor = '';

    uniq.map((f: string, index: number) => {
      id = listaFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;
      atraso = listaFaccoes.filter(
        (op) => op.Status == 'Em atraso' && op.DS_LOCAL == f
      ).length;
      per_atraso = atraso / qnt[f];

      if (per_atraso >= 0.5) {
        cor = 'danger';
      } else if (per_atraso >= 0.01) {
        cor = 'warning';
      } else {
        cor = 'info';
      }

      this.faccaoList.push(
        ...[
          {
            id: id,
            name: f,
            qnt: qnt[f],
            qnt_atraso: atraso,
            per_atraso: Math.floor(per_atraso * 100),
            qnt_pecas: 0,
            ciclo: listaFaccoes.find((x) => x.DS_LOCAL == f)?.NR_CICLO + '',
            colecao: listaFaccoes.find((x) => x.DS_LOCAL == f)?.DS_CICLO,
            color: cor,
          },
        ]
      );
    });

    this.faccaoList.sort((a, b) =>
      a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
    );
    this.faccaoList$.next(this.faccaoList);
  }

  filtroFaccao(event: Event): void {
    document.getElementById('filtro')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
    if (!filterValue) {
      this.faccaoList$.next(this.faccaoList);
      this.filtroAtivo = false;
    } else {
      this.filtroAtivo = true;
      this.faccaoList$.next(
        this.faccaoList.filter((_) =>
          _.name.includes(filterValue.toUpperCase())
        )
      );
      this.faccaoList$.subscribe((x) => this.emptyList.next(!x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.faccaoList$.next(this.faccaoList);
  }

  filtrosDropdown(): void {
    let colecaoFilter = this.selectedColecao.map((item) => item.split('-')[0]);

    this.selectedFilters = {
      origem: '',
      colecao: colecaoFilter,
      apontamentoFilter: '',
    };

    // set the filter service to pass to others components
    this._opsFilteredService.setFilter(this.selectedFilters);

    let filteredOps = this.AllOpsList;

    if (this.selectedColecao.length > 0) {
      filteredOps = this.AllOpsList.filter((x) => {
        return colecaoFilter.includes(x.NR_CICLO + '');
      });

      this.setfaccaolist(filteredOps);
      return;
    }
    this.setfaccaolist(filteredOps);
  }
}

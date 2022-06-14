import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccao } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-list-faccao',
  templateUrl: './list-faccao.component.html',
  styleUrls: ['./list-faccao.component.scss'],
})
export class ListFaccaoComponent implements OnInit {
  selectedColecao: string = '';
  menuColecao: string[] = [];
  selectedFilters = {
    origem: '',
    colecao: this.selectedColecao,
    apontamentoFilter: '',
  };

  emptyList: boolean = false;
  filtroAtivo: boolean = false;
  show_desc: boolean = true;

  color: string[] = ['info', 'warning', 'primary', 'success'];

  localList: any[] = [];
  AllOpsList: OPs = [];
  OpList: Faccao[] = [];
  OpList$: BehaviorSubject<Faccao[]> = new BehaviorSubject(this.OpList);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.selectedFilters = {
      origem: '',
      colecao: '',
      apontamentoFilter: '',
    };

    this._opsFilteredService.setFilter(this.selectedFilters);
    this._setTitle.setTitle('Auditor');
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.AllOpsList = list;
        this.setOPlist(list);

        this.OpList.forEach((x) => {
          this.menuColecao.push(x.colecao!);
          this.menuColecao = [...new Set(this.menuColecao)];
        });

        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }

  setOPlist(listaFaccoes: OPs) {
    this.OpList = [];
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

      this.OpList.push(
        ...[
          {
            id: id,
            name: f,
            qnt: qnt[f],
            qnt_atraso: atraso,
            per_atraso: Math.floor(per_atraso * 100),
            qnt_pecas: 0,
            colecao: listaFaccoes.find((x) => x.DS_LOCAL == f)?.DS_CICLO,
            color: cor,
          },
        ]
      );
    });

    this.OpList.sort((a, b) => (a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0));
    this.OpList$.next(this.OpList);
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

  filtrosDropdown(): void {
    this.selectedFilters = {
      origem: '',
      colecao: this.selectedColecao,
      apontamentoFilter: '',
    };

    // set the filter service to pass to others components
    this._opsFilteredService.setFilter(this.selectedFilters);

    let filteredOps = this.AllOpsList;

    if (!!this.selectedColecao) {
      filteredOps = this.AllOpsList.filter((x) => {
        return x.DS_CICLO == this.selectedColecao;
      });

      this.setOPlist(filteredOps);
      return;
    }
    this.setOPlist(filteredOps);
  }
}

import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccoes } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-list-faccoes',
  templateUrl: './list-faccoes.component.html',
  styleUrls: ['./list-faccoes.component.scss'],
})
export class ListFaccoesComponent implements OnInit {
  color: string[] = ['info', 'warning', 'primary', 'success'];
  emptyList: boolean = false;
  filtroAtivo: boolean = false;
  show_desc: boolean = true;

  AllOpsList: OPs = [];
  listCodOPsDisponiveis: string[] = [];
  listOPsDisponiveis: OPs = [];

  localList: any[] = [];
  faccaoList: Faccoes = [];
  faccaoList$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.faccaoList);

  constructor(
    public _loadingService: LoadingService,
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _auditorService: AuditorService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');

    // pega todos os códigos das ops marcadas como disponível
    this._auditorService.getApontamento().subscribe({
      next: (apontamentos) => {
        let disponiveis = apontamentos.filter(
          (apontamento) => apontamento.Situacao == 'Disponível para coleta'
        );
        this.listCodOPsDisponiveis = disponiveis.flatMap(
          (op) => op.cod + '-' + op.CD_LOCAL
        );

        // listagem de todas as facções que possuem ops com status de apontamento "Disponível para coleta"
        this._opsService.getAllOPs().subscribe({
          next: (ops) => {
            this.listOPsDisponiveis = ops.filter((op) => {
              return this.listCodOPsDisponiveis.includes(
                op.cod + '-' + op.CD_LOCAL
              );
            });

            this.setfaccaolist(this.listOPsDisponiveis);

            this._setTitle.setTitle('Motorista');
          },
          error: (err: Error) => console.error(err),
        });
      },
      error: (err: Error) => console.error(err),
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
            colecao: listaFaccoes.find((x) => x.DS_LOCAL == f)?.DS_CICLO,
            color: cor,
          },
        ]
      );
    });

    this.faccaoList.sort((a, b) =>
      a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
    );
    this.emptyList = !this.faccaoList.length;
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
        this.faccaoList.filter((_) => _.name.includes(filterValue.toUpperCase()))
      );
      this.faccaoList$.subscribe((x) => (this.emptyList = !x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.faccaoList$.next(this.faccaoList);
  }
}

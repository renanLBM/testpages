import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Apontamentos } from 'src/app/models/apontamento';
import { OPDescricoes } from 'src/app/models/opdescricao';
import { OPs } from 'src/app/models/ops';
import { MotoristaService } from 'src/app/services/motorista.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-list-faccoes',
  templateUrl: './list-faccoes.component.html',
  styleUrls: ['./list-faccoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFaccoesComponent implements OnInit {
  color: string[] = ['info', 'warning', 'primary', 'success'];
  emptyList: boolean = false;
  filtroAtivo: boolean = false;
  show_desc: boolean = true;

  listCodOPsDisponiveis: string[] = [];
  listOPsDisponiveis: OPs = [];
  resumoApontamento: Apontamentos = [];

  qtDisponivel: number = 0;
  qtDisponivel$: BehaviorSubject<number> = new BehaviorSubject(
    this.qtDisponivel
  );
  qtColetado: number = 0;
  qtColetado$: BehaviorSubject<number> = new BehaviorSubject(this.qtColetado);
  qtTotal: number = 0;
  qtTotal$: BehaviorSubject<number> = new BehaviorSubject(this.qtTotal);

  localList: any[] = [];
  faccaoList: OPDescricoes = [];
  faccaoList$: BehaviorSubject<OPDescricoes> = new BehaviorSubject(
    this.faccaoList
  );

  constructor(
    private _setTitle: SetTitleServiceService,
    private _motoristaService: MotoristaService,
    private _opsFilteredService: OpsFilteredService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');

    this._opsFilteredService.setFilter({
      origem: '',
      colecao: '',
      apontamentoFilter: '',
    });

    this._motoristaService.listDisponivel().subscribe({
      next: (ops) => {
        this.listOPsDisponiveis = JSON.parse(ops.data);
        this.listOPsDisponiveis.forEach((a) => {
          if (a.DS_APONTAMENTO_DS == 'Disponível para coleta') {
            this.qtDisponivel += +a.QT_OP;
          } else if (a.DS_APONTAMENTO_DS == 'Coletado') {
            this.qtColetado += +a.QT_OP;
          }
          this.qtTotal += a.QT_OP;
        });

        this.qtDisponivel$.next(this.qtDisponivel);
        this.qtColetado$.next(this.qtColetado);
        this.qtTotal$.next(this.qtTotal);

        this.setfaccaolist(this.listOPsDisponiveis);

        this._setTitle.setTitle('Motorista');
        this.emptyList = false;
      },
      error: (err: Error) => console.error(err),
    });
  }

  setfaccaolist(listaFaccoes: OPs) {
    this.faccaoList = [];
    this.localList = listaFaccoes.flatMap((x) => x.DS_LOCAL);

    let qnt_list: any[] = [];

    listaFaccoes.forEach((x) => {
      qnt_list.push({
        local: x['DS_LOCAL'],
        qnt: x['QT_OP'],
      });
    });

    let uniq = [...new Set(this.localList)].filter((item) => item !== '');

    let qnt = this.localList.reduce((prev, cur) => {
      prev[cur] = (prev[cur] || 0) + 1;
      return prev;
    }, {});

    let qntTotalPecasTipo = qnt_list.reduce(
      (
        prev: { [x: string]: any },
        cur: { local: string | number; qnt: string }
      ) => {
        prev[cur.local] = (prev[cur.local] || 0) + parseInt(cur.qnt);
        return prev;
      },
      {}
    );

    this.localList.forEach((t) => {
      if (!qntTotalPecasTipo[t]) {
        qntTotalPecasTipo[t] = 0;
      }
    });

    let pecasArray = Object.keys(qntTotalPecasTipo).map((key) => [
      key,
      qntTotalPecasTipo[key],
    ]);

    let id = 0;
    let atraso = 0;
    let qnt_pecas = 0;
    let cor = '';

    uniq.map((f: string, index: number) => {
      id = listaFaccoes.find((x) => x.DS_LOCAL == f)?.CD_LOCAL!;

      qnt_pecas = +pecasArray.find((x) => x[0] == f)![1] || 0;
      this.faccaoList.push(
        ...[
          {
            id: id,
            name: f,
            qnt: qnt[f],
            qnt_atraso: atraso,
            qnt_pecas: qnt_pecas,
            colecao: listaFaccoes.find((x) => x.DS_LOCAL == f)?.DS_CICLO,
            color: cor,
          },
        ]
      );
    });

    this.faccaoList.sort((a, b) =>
      a.qnt_pecas < b.qnt_pecas ? 1 : b.qnt_pecas < a.qnt_pecas ? -1 : 0
    );

    this.faccaoList.sort((a, b) =>
      a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
    );
    this.emptyList = !this.faccaoList.length;
    this.faccaoList$.next(this.faccaoList);
  }

  filtroApontamento(apontamentoFiltrado: string) {
    // set the filter service to pass to others components
    this._opsFilteredService.setFilter({
      origem: '',
      colecao: '',
      apontamentoFilter: apontamentoFiltrado,
    });
    if (apontamentoFiltrado == 'Todos') {
      this.setfaccaolist(this.listOPsDisponiveis);
      return;
    }
    let faccoes = this.listOPsDisponiveis.filter(
      (ops) => ops.DS_APONTAMENTO_DS == apontamentoFiltrado
    );
    this.setfaccaolist(faccoes);
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
      this.faccaoList$.subscribe((x) => (this.emptyList = !x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.faccaoList$.next(this.faccaoList);
  }
}

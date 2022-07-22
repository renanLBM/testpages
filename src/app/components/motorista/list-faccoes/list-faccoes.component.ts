import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccoes } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { MotoristaService } from 'src/app/services/motorista.service';
import { OpsService } from 'src/app/services/ops.service';
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

  AllOpsList: OPs = [];
  listCodOPsDisponiveis: string[] = [];
  listOPsDisponiveis: OPs = [];

  localList: any[] = [];
  faccaoList: Faccoes = [];
  faccaoList$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.faccaoList);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _motoristaService: MotoristaService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('Carregando...');

    // pega todos os códigos das ops marcadas como disponível
    this._motoristaService.listDisponivel().subscribe({
      next: (apontamentos) => {
        this.listCodOPsDisponiveis = apontamentos.flatMap(
          (op) => op.cod + '-' + op.CD_LOCAL.toString()
        );

        // listagem de todas as facções que possuem ops com status de apontamento "Disponível para coleta"
        this._opsService.getAllOPs().subscribe({
          next: (ops) => {

            this.listOPsDisponiveis = ops.filter((op) => {
              return this.listCodOPsDisponiveis.includes(
                op.cod + '-' + op.CD_LOCAL.toString()
              );
            });

            this.setfaccaolist(this.listOPsDisponiveis);

            this._setTitle.setTitle('Motorista');
            this.emptyList = false;
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

import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Faccoes } from 'src/app/models/faccao';
import { OPs } from 'src/app/models/ops';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

type NbComponentStatus =
  | 'basic'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'control';

interface TipoPorStatus {
  status?: string;
  qnt_total?: number;
  pecas_total?: number;
  tipo?: Faccoes;
  colorAccent?: NbComponentStatus;
}

@Component({
  selector: 'fc-pcp',
  templateUrl: './pcp.component.html',
  styleUrls: ['./pcp.component.scss'],
})
export class PcpComponent implements OnInit {
  selectedOrigem: string = '';
  menuOrigem: string[] = [];
  selectedColecao: string = '';
  menuColecao: string[] = [];
  color: string[] = ['warning', 'info', 'success', 'danger', 'primary'];
  selectedFilters = {
    origem: this.selectedOrigem,
    colecao: this.selectedColecao,
  };

  tipoListOriginal: string[] = [];
  listStatus!: OPs;
  tipoList: any[] = [];
  uniqTipo: any[] = [];
  uniqStatus: any[] = [];
  OpList: Faccoes = [];
  OpList$: BehaviorSubject<Faccoes> = new BehaviorSubject(this.OpList);
  OpTipoList: Faccoes = [];

  statusTipo: TipoPorStatus[] = [
    {
      status: 'Total',
      colorAccent: 'info',
    },
    {
      status: 'Em andamento',
      colorAccent: 'success',
    },
    {
      status: 'Em atraso',
      colorAccent: 'danger',
    },
  ];
  statusTipo$: BehaviorSubject<TipoPorStatus[]> = new BehaviorSubject(
    this.statusTipo
  );

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsService: OpsService,
    private _opsFilteredService: OpsFilteredService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('PCP');
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.listStatus = list;

        this.listStatus.forEach((x) => {
          this.tipoListOriginal.push(x.DS_TIPO);
          this.tipoListOriginal = [...new Set(this.tipoListOriginal)];

          this.menuOrigem.push(x.DS_CLASS);
          this.menuOrigem = [...new Set(this.menuOrigem)];

          this.menuColecao.push(x.DS_CICLO);
          this.menuColecao = [...new Set(this.menuColecao)];

          this.menuColecao.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
        });

        this.summarize();

        // set the filter service to pass to others components
        this._opsFilteredService.setFilter(this.selectedFilters);

        this.statusTipo$.next(this.statusTipo);
        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }

  summarize(filterSelected?: number): void {
    this.tipoList = [];
    this.OpList = [];
    this.OpTipoList = [];

    this.statusTipo = [
      {
        status: 'Total',
        colorAccent: 'info',
        tipo: [],
      },
      {
        status: 'Em andamento',
        colorAccent: 'success',
        tipo: [],
      },
      {
        status: 'Em atraso',
        colorAccent: 'danger',
        tipo: [],
      },
    ];

    let listFilteredOPs = this.listStatus;

    // 1 = dois filtros selecionados
    // 2 = somente origem
    // 3 = somente colecao
    if (filterSelected == 1) {
      listFilteredOPs = this.listStatus.filter(
        (x) =>
          x.DS_CLASS == this.selectedOrigem &&
          x.DS_CICLO == this.selectedColecao
      );
    } else if (filterSelected == 2) {
      listFilteredOPs = this.listStatus.filter(
        (x) => x.DS_CLASS == this.selectedOrigem
      );
    } else if (filterSelected == 3) {
      listFilteredOPs = this.listStatus.filter(
        (x) => x.DS_CICLO == this.selectedColecao
      );
    }

    listFilteredOPs.forEach((x) => {
      this.tipoList.push({
        tipo: x['DS_TIPO'],
        status: x['Status'],
        qnt: x['QT_OP'],
      });
    });
    listFilteredOPs.forEach((x) => {
      this.tipoList.push({
        tipo: 'Total',
        status: x['Status'],
        qnt: x['QT_OP'],
      });
    });

    // set unique type
    this.tipoList.forEach((f: { tipo: string; status: string }) => {
      this.uniqTipo.push(f.tipo + '-' + f.status);
      this.uniqTipo = [...new Set(this.uniqTipo)].filter((item) => item !== '');
    });
    // set unique status
    this.tipoList.forEach((f: { status: any }) => {
      this.uniqStatus.push(f.status);
      this.uniqStatus = [...new Set(this.uniqStatus)].filter(
        (item) => item !== ''
      );
    });

    let qntOpsStatus = this.tipoList
      .filter((tl: { tipo: string }) => tl.tipo == 'Total')
      .reduce(
        (prev: { [x: string]: any }, cur: { status: string | number }) => {
          prev[cur.status] = (prev[cur.status] || 0) + 1;
          return prev;
        },
        {}
      );
    let qntPecasStatus = this.tipoList
      .filter((tl: { tipo: string }) => tl.tipo == 'Total')
      .reduce(
        (
          prev: { [x: string]: any },
          cur: { status: string | number; qnt: string }
        ) => {
          prev[cur.status] = (prev[cur.status] || 0) + +cur.qnt;
          return prev;
        },
        {}
      );
    let totalOpsStatus = this.tipoList
      .filter((tl: { tipo: string }) => tl.tipo == 'Total')
      .reduce((prev: { [x: string]: any }, cur: { tipo: string | number }) => {
        prev[cur.tipo] = (prev[cur.tipo] || 0) + 1;
        return prev;
      }, {});
    let totalPecasStatus = this.tipoList
      .filter((tl: { tipo: string }) => tl.tipo == 'Total')
      .reduce(
        (
          prev: { [x: string]: any },
          cur: { tipo: string | number; qnt: string }
        ) => {
          prev[cur.tipo] = (prev[cur.tipo] || 0) + +cur.qnt;
          return prev;
        },
        {}
      );

    this.uniqStatus.map((s: string, index: number) => {
      this.OpList.push({
        name: s,
        qnt: qntOpsStatus[s] || 0,
        qnt_pecas: +qntPecasStatus[s] || 0,
      });
      s;
    });
    this.OpList.push({
      name: 'Total',
      qnt: totalOpsStatus['Total'] || 0,
      qnt_pecas: totalPecasStatus['Total'] || 0,
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
      a.qnt_pecas < b.qnt_pecas ? 1 : b.qnt_pecas < a.qnt_pecas ? -1 : 0
    );

    let qntTotalPecasTipo = this.tipoList.reduce(
      (
        prev: { [x: string]: any },
        cur: { tipo: string | number; qnt: string }
      ) => {
        prev[cur.tipo] = (prev[cur.tipo] || 0) + parseInt(cur.qnt);
        return prev;
      },
      {}
    );

    let qntTotalOpsTipo = this.tipoList.reduce(
      (prev: { [x: string]: any }, cur: { tipo: string | number }) => {
        prev[cur.tipo] = (prev[cur.tipo] || 0) + 1;
        return prev;
      },
      {}
    );

    let qntPecasTipo = this.tipoList.reduce(
      (
        prev: { [x: string]: any },
        cur: { tipo: string; status: string; qnt: string }
      ) => {
        prev[cur.tipo + '-' + cur.status] =
          (prev[cur.tipo + '-' + cur.status] || 0) + +cur.qnt;
        return prev;
      },
      {}
    );
    let qntOpsTipo = this.tipoList.reduce(
      (prev: { [x: string]: any }, cur: { tipo: string; status: string }) => {
        prev[cur.tipo + '-' + cur.status] =
          (prev[cur.tipo + '-' + cur.status] || 0) + 1;
        return prev;
      },
      {}
    );
    // set the quantity of the itens that where not fount to 0
    this.tipoListOriginal.forEach((t) => {
      if (!qntTotalPecasTipo[t]) {
        qntTotalPecasTipo[t] = 0;
      }
    });

    let pecasArray = Object.keys(qntTotalPecasTipo).map((key) => [
      key,
      qntTotalPecasTipo[key],
    ]);

    for (let i of pecasArray) {
      let key: string = i[0];
      if (key != 'Total') {
        this.OpTipoList.push(
          ...[
            {
              name: key,
              qnt: qntTotalOpsTipo[key] || 0,
              status: 'Total',
              qnt_pecas: +i[1] || 0,
            },
          ]
        );
      }
    }
    this.uniqTipo.map((s: string, index: number) => {
      if (s.split('-')[0] != 'Total') {
        this.OpTipoList.push(
          ...[
            {
              name: s.split('-')[0],
              qnt: qntOpsTipo[s] || 0,
              status: s.split('-')[1],
              qnt_pecas: +qntPecasTipo[s] || 0,
            },
          ]
        );
      }
    });

    this.OpTipoList.sort((a, b) =>
      a.name! > b.name! ? 1 : b.name! > a.name! ? -1 : 0
    );

    this.statusTipo.forEach((s) => {
      let tmpOP: Faccoes = [];
      this.OpTipoList.filter((n) => n.status?.includes(s.status!)).forEach(
        (op) => {
          tmpOP.push(op);
        }
      );
      let idx = this.statusTipo.findIndex((st) => st.status == s.status);
      this.statusTipo[idx] = {
        status: this.statusTipo[idx].status,
        tipo: tmpOP,
        colorAccent: this.statusTipo[idx].colorAccent,
      };
    });

    this.statusTipo$.next(this.statusTipo);
    this.OpList$.next(this.OpList);
  }

  filtrosDropdown(): void {
    this.selectedFilters = {
      origem: this.selectedOrigem,
      colecao: this.selectedColecao,
    };

    // set the filter service to pass to others components
    this._opsFilteredService.setFilter(this.selectedFilters);

    // 1 = dois filtros selecionados
    if (!!this.selectedColecao && !!this.selectedOrigem) {
      this.summarize(1);
      return;
    }
    // 2 = somente origem
    if (!!this.selectedOrigem) {
      this.summarize(2);
      return;
    }
    // 3 = somente colecao
    if (!!this.selectedColecao) {
      this.summarize(3);
      return;
    }
    this.summarize();
  }
}

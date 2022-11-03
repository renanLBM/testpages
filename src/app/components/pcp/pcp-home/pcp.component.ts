import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import {
  ApontamentosResumidos,
  ApontamentosTotal,
} from 'src/app/models/apontamento';
import { OPs } from 'src/app/models/ops';
import { ApontamentoService } from 'src/app/services/apontamento.service';
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

type tplotOptions = {
  [key: string]: string;
};

interface ResumoPorStatus {
  status: string;
  qnt_total: number;
  pecas_total: number;
  colorAccent: NbComponentStatus;
  tipo?: TipoPorStatus[];
}
interface TipoPorStatus {
  ds_tipo: string;
  qnt: number;
  pecas: number;
}

@Component({
  selector: 'fc-pcp',
  templateUrl: './pcp.component.html',
  styleUrls: ['./pcp.component.scss'],
})
export class PcpComponent implements OnInit {
  orderApontamento = [
    'Não informado',
    'Em transporte',
    'Em fila',
    'Em produção',
    'Em inspeção',
    'Parado',
    'Disponível para coleta',
    'Coletado',
    'Não industrializado',
  ];
  corApontamento: tplotOptions = {
    'Não informado': 'danger',
    'Em transporte': 'danger',
    'Em fila': 'primary',
    'Em produção': 'info',
    Parado: 'warning',
    'Em inspeção': 'inspecao',
    'Disponível para coleta': 'success',
    Coletado: 'coletado',
    'Não industrializado': 'industrializado',
  };
  color = ['info', 'success', 'danger'];
  resumoStatus: ResumoPorStatus[] = [];

  selectedFilters: {
    origem: string[];
    colecao: string[];
    apontamentoFilter: string;
  } = {
    origem: [],
    colecao: [],
    apontamentoFilter: '',
  };

  tmpColecao: string[] = [];
  uniqStatus: any[] = [];
  uniqTipo: any[] = [];
  uniqColecao: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  colecaoFiltrada: any[] = [];
  tmpOrigem: string[] = [];
  uniqOrigem: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  origemFiltrada: any[] = [];
  uniqApontamento: any[] = [];

  apontamentoTotal: ApontamentosTotal = [];
  resumoApontamento: ApontamentosResumidos = [];
  resumoRetorno: OPs = [];
  resumoTipo!: TipoPorStatus;

  resumoStatus$: BehaviorSubject<ResumoPorStatus[]> = new BehaviorSubject<
    ResumoPorStatus[]
  >(this.resumoStatus);
  apontamentoTotal$: BehaviorSubject<ApontamentosTotal> =
    new BehaviorSubject<ApontamentosTotal>(this.apontamentoTotal);

  emptyList: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opService: OpsService,
    private _apontamentoService: ApontamentoService,
    private _opsFilteredService: OpsFilteredService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setTitle.setTitle('PCP');

    this._opsFilteredService.setFilter(this.selectedFilters);

    this._opService
      .getAllOPsResumido()
      .pipe(
        tap(
          this._apontamentoService.getApontamentosResumido().subscribe({
            next: (item) => {
              this.resumoApontamento = JSON.parse(item.data);
              this.resumoApontamento.forEach((item) => {
                this.uniqApontamento.push(item.DS_APONTAMENTO_DS);
                this.uniqApontamento = [...new Set(this.uniqApontamento)];
              });
            },
          })
        )
      )
      .subscribe({
        next: (item) => {
          this.resumoRetorno = JSON.parse(item.data);

          this.uniqStatus.push('Total');

          this.resumoRetorno.forEach((item) => {
            this.uniqStatus.push(item.Status);
            this.uniqStatus = [...new Set(this.uniqStatus)];

            this.uniqTipo.push(item.DS_TIPO);
            this.uniqTipo = [...new Set(this.uniqTipo)];
            this.tmpColecao.push(item.NR_CICLO + '-' + item.DS_CICLO);
            this.tmpColecao = [...new Set(this.tmpColecao)];
            this.tmpColecao.sort((a, b) =>
              +a.split('-')[0] > +b.split('-')[0]
                ? 1
                : +b.split('-')[0] > +a.split('-')[0]
                ? -1
                : 0
            );
            this.uniqColecao.next(this.tmpColecao);
            this.tmpOrigem.push(item.DS_CLASS);
            this.tmpOrigem = [...new Set(this.tmpOrigem)];
            this.uniqOrigem.next(this.tmpOrigem);
          });

          this.summarize(this.resumoRetorno, this.resumoApontamento);
          this.resumoStatus$.next(this.resumoStatus);
          this.apontamentoTotal$.next(this.apontamentoTotal);
          this.emptyList.next(!this.resumoStatus.length);
          this.loading.next(false);
        },
      });
  }

  summarize(listaDeOPs: OPs, listaApontamento: ApontamentosResumidos): void {
    // reset do array dos Status
    this.resumoStatus = [
      {
        status: 'Total',
        colorAccent: 'info',
        qnt_total: 0,
        pecas_total: 0,
        tipo: [],
      },
      {
        status: 'Em andamento',
        colorAccent: 'success',
        qnt_total: 0,
        pecas_total: 0,
        tipo: [],
      },
      {
        status: 'Em atraso',
        colorAccent: 'danger',
        qnt_total: 0,
        pecas_total: 0,
        tipo: [],
      },
    ];
    this.apontamentoTotal = [
      {
        DS_APONTAMENTO_DS: 'Não informado',
        cor: 'danger',
        qnt: 0,
        pecas: 0,
      },
    ];

    // variaveis temporárias para somatório
    let tipoEmAndamentoTmp: TipoPorStatus[] = [];
    let tipoEmAndamento: TipoPorStatus[] = [];
    let tipoEmAtrasoTmp: TipoPorStatus[] = [];
    let tipoEmAtraso: TipoPorStatus[] = [];
    let tipoTotalTmp: TipoPorStatus[] = [];
    let tipoTotal: TipoPorStatus[] = [];

    listaDeOPs.forEach((item) => {
      // passar por todos os itens do array para o somatório total
      this.resumoStatus.filter((s) => s.status == item.Status)[0].qnt_total +=
        +item.qnt! || 0;
      this.resumoStatus.filter((s) => s.status == item.Status)[0].pecas_total +=
        +item.pecas! || 0;

      // passar por todos os itens do array para o somatório de cada status por Tipo
      if (item.Status == 'Em andamento') {
        tipoEmAndamentoTmp.push({
          ds_tipo: item.DS_TIPO,
          qnt: item.qnt || 0,
          pecas: item.pecas || 0,
        });
      } else if (item.Status == 'Em atraso') {
        tipoEmAtrasoTmp.push({
          ds_tipo: item.DS_TIPO,
          qnt: item.qnt || 0,
          pecas: item.pecas || 0,
        });
      }
      tipoTotalTmp.push({
        ds_tipo: item.DS_TIPO,
        qnt: item.qnt || 0,
        pecas: item.pecas || 0,
      });
      // Status Total
      this.resumoStatus.filter((s) => s.status == 'Total')[0].qnt_total +=
        +item.qnt! || 0;
      this.resumoStatus.filter((s) => s.status == 'Total')[0].pecas_total +=
        +item.pecas! || 0;
    });

    // somatório dos tipos por cada status
    tipoEmAndamentoTmp.forEach((t) => {
      let tmp = tipoEmAndamento.find((o) => o.ds_tipo === t.ds_tipo);
      if (!tmp) {
        // se ainda não existe no array, então inclui
        tipoEmAndamento.push({
          pecas: t.pecas,
          qnt: t.qnt,
          ds_tipo: t.ds_tipo,
        });
      } else {
        // caso já exista soma
        tmp.pecas += t.pecas;
        tmp.qnt += t.qnt;
      }
    });
    tipoEmAtrasoTmp.forEach((t) => {
      let tmp = tipoEmAtraso.find((o) => o.ds_tipo === t.ds_tipo);
      if (!tmp) {
        tipoEmAtraso.push({
          pecas: t.pecas,
          qnt: t.qnt,
          ds_tipo: t.ds_tipo,
        });
      } else {
        tmp.pecas += t.pecas;
        tmp.qnt += t.qnt;
      }
    });
    tipoTotalTmp.forEach((t) => {
      let tmp = tipoTotal.find((o) => o.ds_tipo === t.ds_tipo);
      if (!tmp) {
        tipoTotal.push({
          pecas: t.pecas,
          qnt: t.qnt,
          ds_tipo: t.ds_tipo,
        });
      } else {
        tmp.pecas += t.pecas;
        tmp.qnt += t.qnt;
      }
    });

    // inclui os tipos já com as quantidades somadas ao array com os totais por status
    this.resumoStatus.forEach((rs) => {
      if (rs.status == 'Em andamento') {
        rs.tipo = tipoEmAndamento;
      } else if (rs.status == 'Em atraso') {
        rs.tipo = tipoEmAtraso;
      } else if (rs.status == 'Total') {
        rs.tipo = tipoTotal;
      }
    });

    // inicialização do array de apontamentos
    this.uniqApontamento.forEach((a: string) => {
      this.apontamentoTotal.push({
        DS_APONTAMENTO_DS: a,
        cor: this.corApontamento[a],
        qnt: 0,
        pecas: 0,
      });
    });

    // somatório das quantidades por apontamento
    listaApontamento.forEach((ap) => {
      if (
        // verifica se existe algum apontamento no array filtrado
        !!this.apontamentoTotal.filter(
          (s) => s.DS_APONTAMENTO_DS == ap.DS_APONTAMENTO_DS
        ).length
      ) {
        this.apontamentoTotal.filter((s) => {
          return s.DS_APONTAMENTO_DS == ap.DS_APONTAMENTO_DS;
        })[0].qnt += +ap.count;
        this.apontamentoTotal.filter(
          (s) => s.DS_APONTAMENTO_DS == ap.DS_APONTAMENTO_DS
        )[0].pecas += +ap.sum;
      }
    });

    // classifica os apontamentos de acordo com o array "orderApontamento"
    this.apontamentoTotal.sort((a, b) => {
      return (
        this.orderApontamento.indexOf(a.DS_APONTAMENTO_DS) -
        this.orderApontamento.indexOf(b.DS_APONTAMENTO_DS)
      );
    });

    // // cria um apontamento "Total" para identificar quantos não estão informados
    let apTotal: { count?: number; sum?: number } = {};
    // verifica se existe algum item na lista de apontamentos passada como parâmetro
    if (!!listaApontamento.length) {
      // somatorio do total para identificar os não informados
      apTotal = listaApontamento.reduce((prev, cur) => {
        prev.DS_APONTAMENTO_DS = 'Total';
        prev.DS_CLASS = 'Total';
        prev.NR_CICLO = 0;
        prev.count += cur.count || 0;
        prev.sum += cur.sum || 0;
        return prev;
      });
    }

    // filtra somente os totais para identificar a quantidade de não informados
    let qtTotal = this.resumoStatus.filter((rs) => {
      return rs.status == 'Total';
    })[0].qnt_total;
    let pecasTotal = this.resumoStatus.filter((rs) => {
      return rs.status == 'Total';
    })[0].pecas_total;

    // subtrai o total de todas as ops com o total que foi inserido algum apontamento
    if (!!listaApontamento.length) {
      this.apontamentoTotal.filter(
        (i) => i.DS_APONTAMENTO_DS == 'Não informado'
      )[0].qnt = qtTotal - apTotal.count!;
      this.apontamentoTotal.filter(
        (i) => i.DS_APONTAMENTO_DS == 'Não informado'
      )[0].pecas = pecasTotal - apTotal.sum!;
    } else {
      this.apontamentoTotal.filter(
        (i) => i.DS_APONTAMENTO_DS == 'Não informado'
      )[0].qnt = qtTotal!;
      this.apontamentoTotal.filter(
        (i) => i.DS_APONTAMENTO_DS == 'Não informado'
      )[0].pecas = pecasTotal!;
    }
  }

  filterApontamento(filtro: string) {}

  filtrosDropdown(): void {
    this.resumoApontamento.push({
      DS_CLASS: 'Total',
      NR_CICLO: 0,
      DS_APONTAMENTO_DS: 'Total',
      sum: 0,
      count: 0,
    });
    this.loading.next(true);
    // reset das variáveis
    let nrCicloFiltrado: any[] = [];
    let filtroTmpColecao: string[] = [];
    let filtroUniqOrigem: string[] = [];
    let colecaoFilter = this.colecaoFiltrada.map((item) => item.split('-')[0]);

    this.selectedFilters = {
      origem: this.origemFiltrada,
      colecao: colecaoFilter,
      apontamentoFilter: '',
    };

    // set the filter service to pass to others components
    this._opsFilteredService.setFilter(this.selectedFilters);

    // separa o nr_ciclo do ds_ciclo
    this.colecaoFiltrada.forEach((x) => {
      nrCicloFiltrado.push(+x.split('-')[0]);
    });
    // verificar qual o filtro foi selecionado
    let hasOrigem = !!this.origemFiltrada.length;
    let hasColecao = !!this.colecaoFiltrada.length;
    // switch case para filtrar o que foi selecionado
    let filtroSelecionado =
      hasOrigem && hasColecao ? 3 : hasColecao ? 2 : hasOrigem ? 1 : 0;
    let filtradasOPs: OPs = [];
    let filtradasApontamentos: ApontamentosResumidos = [];
    switch (filtroSelecionado) {
      case 1:
        filtradasOPs = this.resumoRetorno.filter((ops) => {
          return this.origemFiltrada.includes(ops.DS_CLASS);
        });
        filtradasOPs.forEach((item) => {
          filtroTmpColecao.push(item.NR_CICLO + '-' + item.DS_CICLO);
          filtroTmpColecao = [...new Set(filtroTmpColecao)];
        });
        filtroTmpColecao.sort((a, b) =>
          +a.split('-')[0] > +b.split('-')[0]
            ? 1
            : +b.split('-')[0] > +a.split('-')[0]
            ? -1
            : 0
        );
        this.uniqColecao.next(filtroTmpColecao);

        filtradasApontamentos = this.resumoApontamento.filter((aps) => {
          return this.origemFiltrada.includes(aps.DS_CLASS);
        });
        break;
      case 2:
        filtradasOPs = this.resumoRetorno.filter((ops) => {
          return nrCicloFiltrado.includes(ops.NR_CICLO);
        });
        filtradasOPs.forEach((item) => {
          filtroUniqOrigem.push(item.DS_CLASS);
          filtroUniqOrigem = [...new Set(filtroUniqOrigem)];
        });
        this.uniqOrigem.next(filtroUniqOrigem);

        filtradasApontamentos = this.resumoApontamento.filter((aps) => {
          return nrCicloFiltrado.includes(+aps.NR_CICLO);
        });
        break;
      case 3:
        filtradasOPs = this.resumoRetorno.filter((ops) => {
          return (
            this.origemFiltrada.includes(ops.DS_CLASS) &&
            nrCicloFiltrado.includes(ops.NR_CICLO)
          );
        });
        filtradasApontamentos = this.resumoApontamento.filter((aps) => {
          return (
            this.origemFiltrada.includes(aps.DS_CLASS) &&
            nrCicloFiltrado.includes(+aps.NR_CICLO)
          );
        });
        break;
      default:
        this.uniqColecao.next(this.tmpColecao);
        this.uniqOrigem.next(this.tmpOrigem);
        filtradasOPs = this.resumoRetorno;
        filtradasApontamentos = this.resumoApontamento;
    }

    this.summarize(filtradasOPs, filtradasApontamentos);
    this.resumoStatus$.next(this.resumoStatus);
    this.apontamentoTotal$.next(this.apontamentoTotal);
    this.loading.next(false);
  }
}

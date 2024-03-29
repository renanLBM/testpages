import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NbDialogService,
  NbMenuService,
  NbToastrService,
  NbWindowControlButtonsConfig,
  NbWindowService,
} from '@nebular/theme';
import { BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Apontamento, Apontamentos } from 'src/app/models/apontamento';
import { descOP, descOPs } from 'src/app/models/descOP';
import { ApontamentoList } from 'src/app/models/enums/enumApontamentos';
import { Pages } from 'src/app/models/enums/enumPages';
import { Motivo, Motivos } from 'src/app/models/motivo';
import { OP, OPs } from 'src/app/models/ops';
import { ApontamentoService } from 'src/app/services/apontamento.service';
import { AtrasoService } from 'src/app/services/atraso.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { CarosselComponent } from 'src/app/shared/components/carossel/carossel.component';
import { DialogHistComponent } from 'src/app/shared/components/dialog-hist/dialog-hist.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { DataTableConstants } from 'src/app/shared/datatable-constants.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

const MILISEG_EM_UM_DIA = 24 * 3600 * 1000;
const AJUSTE_3_HORAS = 10800000;

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoFaccaoComponent implements OnInit, OnDestroy {
  dtHoje = new Date();
  itensLimite = 10;

  selectedApontamento: string[] = [];
  idSelectedApontamento: number[] = [];

  apontamentoEnum = ApontamentoList;
  menuApontamento: string[] = [];
  isDistribuicao = false;
  isInterno = false;
  isUsuario = false;
  showMenu = new BehaviorSubject<boolean>(true);

  counter: number = 0;
  defaultImage = '../../../../assets/not-found.png';
  urlBase = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';
  loadingError: boolean = false;
  isEmptyList: boolean = false;
  filtroAtivo: boolean = false;
  routeId: string = '0';

  qntOPs: number = 0;
  qntPecas: number = 0;
  dataIni!: Date;
  dataFim!: Date;

  semanaAtual: number = 0;
  anoAtual: number = 0;
  semanaSelecionada: string = '0';
  closestSemana: number = 0;
  semanaList: { semana: number; ano: number }[] = [];
  semanaListAtraso: number[] = [];
  semanaListFuturo: { semana: number; ano: number }[] = [];

  listOPs: OPs = [];
  tempOP!: descOP;
  descOPLoad = new BehaviorSubject<boolean>(true);
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  motivoList!: Motivos;
  motivo!: Motivo;
  apontamentoList!: Apontamentos;
  apontamento!: Apontamento;
  imgList: string[] = [];

  subscription!: Subscription;

  itemsMenu = [
    { title: 'Atraso' },
    { title: 'Adiantamento' },
    { title: 'Histórico Previsão' },
    { title: 'Apontamento de Produção' },
    { title: 'Download Ficha Técnica' },
  ];

  constructor(
    public _loadingService: LoadingService,
    private NbDdialogService: NbDialogService,
    private toastrService: NbToastrService,
    private windowService: NbWindowService,
    private nbMenuService: NbMenuService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _setTitle: SetTitleServiceService,
    private _opsFilteredService: OpsFilteredService,
    private _opsService: OpsService,
    private _atrasoService: AtrasoService,
    private _apontamentoService: ApontamentoService,
    private _userService: UserService,
    private _datatableConstants: DataTableConstants,
    private _pendenciasService: PendenciasService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // #################
    this.dtHoje.setHours(0, 0, 0, 0);
    let userNivel = this._userService.getNivel();
    this.routeId = this._route.snapshot.paramMap.get('id')!;
    this.isDistribuicao = this.routeId == '302';
    this.isInterno = ['302', '8921'].includes(this.routeId);
    this.isUsuario = userNivel == 5;

    if (Pages[userNivel] == 'fornecedor')
      this.itemsMenu = [
        { title: 'Apontamento de Produção' },
        { title: 'Histórico' },
      ];

    this.verificaAcesso();
    // pega o filtro setado na página anterior (escolha da facção)
    const filtroColecao: string[] =
      this._opsFilteredService.getFilter().colecao;
    const filtroRef: string = this._opsFilteredService.getFilterRef();

    this.getWeek(); // pega semana e ano atual

    this._setTitle.setTitle('Carregando...');

    // chamando todos os serviços com forkjoin
    this.subscription = forkJoin([
      this._apontamentoService.getApontamento(this.routeId),
      this._atrasoService.getMotivos(this.routeId),
      this._opsService.getOpByLocal(this.routeId),
    ]).subscribe((res) => {
      // Apontamentos
      this.apontamentoList = JSON.parse(res[0].data).filter(
        (apontamentoBase: { CD_LOCAL: string }) =>
          apontamentoBase.CD_LOCAL + '' == this.routeId
      );
      let situacaoEnum = Object.values(ApontamentoList).filter(
        (value) => typeof value === 'string'
      );
      for (let [i, item] of situacaoEnum.entries()) {
        this.menuApontamento.push(item as string);
      }

      // Motivos
      this.motivoList = JSON.parse(res[1].data);

      // Local
      let ops = JSON.parse(res[2].data);
      ops[0].DS_LOCAL = ops[0].DS_LOCAL.replace('EXT. ', '');
      this.isDistribuicao = ops[0].CD_LOCAL == 302;
      if (this.isDistribuicao || this.isUsuario) {
        this.showMenu.next(false);
      }
      this.ajusteDosDados(filtroColecao, ops, filtroRef);
    });
  }

  ngAfterContentInit() {
    this.descOP$.next(this.descOP);
  }

  trackByOP(_index: number, op: { NR_REDUZIDOOP: number }) {
    return op.NR_REDUZIDOOP;
  }

  ajusteDosDados(
    filtroColecao: string[],
    ops: OPs,
    filtroRef: string = ''
  ): void {
    if (filtroColecao.length > 0) {
      ops = ops.filter((op) => {
        return filtroColecao.includes(op.NR_CICLO + '');
      });
    }
    if (!!filtroRef) {
      ops = ops.filter((op) => {
        return op.CD_REFERENCIA.includes(filtroRef);
      });
    }

    ops.sort((a, b) =>
      a.DT_PREVRETORNO > b.DT_PREVRETORNO
        ? 1
        : b.DT_PREVRETORNO > a.DT_PREVRETORNO
        ? -1
        : 0
    );

    let imgListAll: string[] = [];
    let maiorMotivo;
    let maiorApontamento;

    ops.forEach((op: OP) => {
      let newImage = new Image();
      newImage.src =
        this.urlBase +
        op.CD_REFERENCIA.toString() +
        '/' +
        op.CD_REFERENCIA.toString() +
        '-1.jpg';

      newImage.onerror = () => {
        this.imgList = this.imgList.filter(
          (im) => !im.includes(op.CD_REFERENCIA.toString())
        );
      };

      for (let j = 1; j <= 13; j++) {
        imgListAll.push(
          this.urlBase +
            op.CD_REFERENCIA.toString() +
            '/' +
            op.CD_REFERENCIA.toString() +
            '-' +
            j +
            '.jpg'
        );
        this.imgList = [...new Set(imgListAll)];
      }

      maiorMotivo = this.filtraMaiorMotivo(
        op.NR_REDUZIDOOP! + '-' + op.CD_LOCAL
      );
      maiorApontamento = this.filtraMaiorApontamento(
        op.NR_REDUZIDOOP! + '-' + op.CD_LOCAL
      );

      let prevdate = new Date(op.DT_PREVRETORNO || '01/01/2001');
      prevdate = new Date(prevdate.setHours(prevdate.getHours() + 3));
      prevdate =
        prevdate.toLocaleString() == 'Invalid Date'
          ? new Date('01/01/2001')
          : new Date(prevdate.setHours(prevdate.getHours() + 3));
      let prev =
        prevdate.toLocaleString() != 'Invalid Date'
          ? prevdate.toLocaleString('pt-br').substring(0, 10)
          : '01/01/2001';

      // pega semana da op
      let oneJan = new Date(prevdate.getFullYear(), 0, 1);
      let numberOfDays = Math.floor(
        (prevdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
      );
      let prevSemana: { semana: number; ano: number } = { semana: 0, ano: 0 };

      if (prevdate.toLocaleString('pt-br').substring(0, 10) != '01/01/2001') {
        if (prevdate.getDay() === 0) {
          prevSemana = {
            semana: Math.floor((prevdate.getDay() + 1 + numberOfDays) / 7) + 2,
            ano: prevdate.getFullYear(),
          };
        } else {
          prevSemana = {
            semana:
              Math.abs(
                Math.floor((prevdate.getDay() + 1 + numberOfDays - 3) / 7)
              ) + 2,
            ano: prevdate.getFullYear(),
          };
        }
      }

      let diasNaFaccao = Math.floor(
        (this.dtHoje.getTime() - parseInt(op.DT_ENTRADA)) / MILISEG_EM_UM_DIA
      );

      this.descOP.push({
        semana: prevSemana.semana,
        ano: prevSemana.ano,
        cd_local: op.CD_LOCAL,
        local: op.DS_LOCAL,
        cod:
          op.NR_CICLO.toString() +
          '-' +
          op.NR_OP.toString() +
          '-' +
          op.CD_REFERENCIA.toString(),
        ciclo: op.NR_CICLO,
        op: op.NR_OP,
        ref: op.CD_REFERENCIA + '',
        NR_REDUZIDOOP: op.NR_REDUZIDOOP!,
        previsao: prev,
        diasNaFaccao: diasNaFaccao,
        statusDiasNaFaccao:
          diasNaFaccao > 30 ? 'atencao' : diasNaFaccao > 20 ? 'cuidado' : 'ok',
        iconDiasNaFaccao:
          diasNaFaccao > 30
            ? 'alert-triangle-outline'
            : diasNaFaccao > 20
            ? 'alert-circle-outline'
            : '',
        entrada: op.DT_ENTRADA,
        DS_APONTAMENTO_DS:
          maiorApontamento.DS_APONTAMENTO_DS || 'Não informado',
        CD_ATRASO: maiorMotivo.cd_atraso,
        novaprevisao: new Date(maiorMotivo.dt_atraso)
          .toLocaleString('pt-Br', {
            timeZone: 'UTC',
          })
          .substring(0, 10),
        motivo_atraso: maiorMotivo.ds_atraso,
        checked: maiorMotivo.i_checked,
        descricao: op.DS_GRUPO,
        drop: op.DS_DROP,
        colecao: op.DS_COLECAO,
        img:
          this.urlBase +
          op.CD_REFERENCIA.toString() +
          '/' +
          op.CD_REFERENCIA.toString() +
          '-1.jpg',
        link_ficha_tecnica:
          this.urlBase +
          '_FichasTecnicas/' +
          op.CD_REFERENCIA.toString() +
          '.pdf',
        status: op.Status,
        status_color: op.Status.toLowerCase().replace(' ', '-'),
        qnt: op.QT_OP,
        accent:
          op.Status == 'Em andamento'
            ? 'success'
            : op.Status == 'Pendente'
            ? 'warning'
            : op.Status == 'Em atraso'
            ? 'danger'
            : 'basic',
      });
    });

    this.listWeeks(this.descOP); // verifica semanas maiores e menores

    this.verifyClosestWeek(); // verifica a semana mais próxima para selecionar

    this.ajustarTituloPagina(this.descOP[0].local); // arruma o titulo para ficar mais legivel

    if (this.isDistribuicao) this.ordenarMenor(); // se distribuição, ordenar por entrada

    this.descOP$.next(this.descOP);
    this.descOPLoad.next(!this.descOP.length);

    this.filtraSemana(false, parseInt(this.semanaSelecionada)); // filtra somente a semana atual
  }

  ordenarMenor(): void {
    this.itensLimite = 10;
    this.descOP.sort((a, b) => {
      let dateA = new Date(a.entrada! || '0');
      let dateB = new Date(b.entrada! || '0');
      let result = dateA > dateB ? 1 : dateB > dateA ? -1 : 0;

      return result;
    });
    this.descOP$.next(this.descOP);
  }

  ordenarMaior(): void {
    this.itensLimite = 10;
    this.descOP.sort((a, b) => {
      let dateA: Date = new Date(a.entrada! || '0');
      let dateB: Date = new Date(b.entrada! || '0');
      let result = dateA < dateB ? 1 : dateB < dateA ? -1 : 0;

      return result;
    });
    this.descOP$.next(this.descOP);
  }

  filtraMaiorMotivo(cod: string) {
    if (this.motivoList) {
      if (this.motivoList.toString() != 'error') {
        let motivos = this.motivoList.filter(
          (m) => m.NR_REDUZIDOOP + '-' + m.CD_LOCAL == cod
        );
        if (motivos.length > 0) {
          // se tiver motivos na lista
          this.motivo = motivos.reduce((p, c) => {
            return p.ID_NOVO_MOTIVO! > c.ID_NOVO_MOTIVO! ? p : c;
          });
          if (+this.motivo.DT_PREV_RETORNO_NOVA < (+this.dtHoje - AJUSTE_3_HORAS)) {
            return {
              cd_atraso: 0,
              ds_atraso: '',
              dt_atraso: '',
              i_checked: false,
            };
          } else {
            if (this.motivo.DS_ATRASO_DS == 'Adiantamento') {
              if (
                +this.motivo.DT_PREV_RETORNO_NOVA >=
                  this.motivo.DT_PREVRETORNO!
              ) {
                return {
                  cd_atraso: 0,
                  ds_atraso: '',
                  dt_atraso: '',
                  i_checked: false,
                };
              }
            } else if (this.motivo.DS_ATRASO_DS != 'Adiantamento') {
              if (
                +this.motivo.DT_PREV_RETORNO_NOVA <= this.motivo.DT_PREVRETORNO!
              ) {
                return {
                  cd_atraso: 0,
                  ds_atraso: '',
                  dt_atraso: '',
                  i_checked: false,
                };
              }
            }
            return {
              cd_atraso: this.motivo.CD_ATRASO,
              ds_atraso: this.motivo.DS_ATRASO_DS,
              dt_atraso: +this.motivo.DT_PREV_RETORNO_NOVA + AJUSTE_3_HORAS,
              i_checked: true,
            };
          }
        }
      }
    }
    return { cd_atraso: 0, ds_atraso: '', dt_atraso: '', i_checked: false };
  }

  filtraMaiorApontamento(cod: string) {
    if (this.apontamentoList) {
      if (this.apontamentoList.toString() != 'error') {
        let apontamentos = this.apontamentoList.filter(
          (m) => m.NR_REDUZIDOOP + '-' + m.CD_LOCAL == cod
        );
        if (apontamentos.length > 0) {
          this.apontamento = apontamentos.reduce((p, c) => {
            return p.ID_NOVA_SITUACAO! > c.ID_NOVA_SITUACAO! ? p : c;
          });
          return {
            DS_APONTAMENTO_DS: this.apontamento.DS_APONTAMENTO_DS,
            dt_coleta: '',
          };
        }
      }
    }
    return { ds_atraso: '', dt_atraso: '', i_checked: false };
  }

  filtroOP(event: Event): void {
    this.itensLimite = 10;
    document.getElementById('filtro-op')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
    this.idSelectedApontamento = [];
    if (filterValue == '') {
      this.filtroAtivo = false;
      this.descOP$.next(this.descOP);
      if (this.semanaSelecionada != 'Todas' && !this.isInterno) {
        this.descOP$.next(
          this.descOP.filter(
            (_) => _.semana == parseInt(this.semanaSelecionada)
          )
        );
      }
    } else {
      this.filtroAtivo = true;
      if (this.semanaSelecionada != 'Todas') {
        if (this.isInterno) {
          this.descOP$.next(
            this.descOP.filter((_) =>
              _.cod?.includes(filterValue.toUpperCase())
            )
          );
        } else {
          this.descOP$.next(
            this.descOP.filter(
              (_) =>
                _.cod?.includes(filterValue.toUpperCase()) &&
                _.semana == parseInt(this.semanaSelecionada)
            )
          );
        }
      } else {
        this.descOP$.next(
          this.descOP.filter((_) => _.cod?.includes(filterValue.toUpperCase()))
        );
      }
      const descOPSubscription = this.descOP$.subscribe((x) => {
        this.isEmptyList = !x.length;
        this.countOPs(x);
      });

      this.subscription.add(descOPSubscription);
    }
  }

  filtrosDropdown() {
    this.itensLimite = 10;
    this.selectedApontamento = [];
    this.idSelectedApontamento.forEach((x) => {
      this.selectedApontamento.push(this.apontamentoEnum[x]);
    });
    this.filtroAtivo = false;
    (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
    if (this.semanaSelecionada != 'Todas') {
      this.descOP$.next(
        this.descOP.filter((_) => _.semana == parseInt(this.semanaSelecionada))
      );
      if (this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => {
            let situacaoAjustada = _.DS_APONTAMENTO_DS?.includes('Parado')
              ? 'Parado'
              : _.DS_APONTAMENTO_DS;
            return (
              this.selectedApontamento.includes(situacaoAjustada!) &&
              _.semana == parseInt(this.semanaSelecionada)
            );
          })
        );
      }
    } else {
      this.descOP$.next(this.descOP);
      if (this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => {
            let situacaoAjustada = _.DS_APONTAMENTO_DS?.includes('Parado')
              ? 'Parado'
              : _.DS_APONTAMENTO_DS;
            return this.selectedApontamento.includes(situacaoAjustada!);
          })
        );
      }
    }
    const descOPSubscription = this.descOP$.subscribe((x) => {
      this.isEmptyList = !x.length;
      this.countOPs(x);
    });

    this.subscription.add(descOPSubscription);
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.itensLimite = 10;
    this.filtroAtivo = false;
    item.value = '';
    this.descOP$.next(this.descOP);
    if (this.semanaSelecionada != 'Todas') {
      if (!this.isInterno) {
        this.descOP$.next(
          this.descOP.filter(
            (_) => _.semana == parseInt(this.semanaSelecionada)
          )
        );
      }
    }
  }

  filtraSemana(reset: boolean, eventSemana: number, eventAno?: number) {
    this.itensLimite = 10;
    this.qntOPs = 0;
    this.qntPecas = 0;
    if (reset) {
      this.semanaSelecionada = this.semanaAtual + '';
    }
    if (eventSemana == -1) {
      this.semanaSelecionada = 'Todas';
      (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
      this.descOP$.next(this.descOP);
      if (this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => {
            let situacaoAjustada = _.DS_APONTAMENTO_DS?.includes('Parado')
              ? 'Parado'
              : _.DS_APONTAMENTO_DS;
            return this.selectedApontamento.includes(situacaoAjustada!);
          })
        );
      }
    } else if (eventSemana == 0) {
      this.semanaSelecionada = 'Em Atraso';
      (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
      this.descOP$.next(this.descOP);
      if (this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => {
            let situacaoAjustada = _.DS_APONTAMENTO_DS?.includes('Parado')
              ? 'Parado'
              : _.DS_APONTAMENTO_DS;
            return (
              this.selectedApontamento.includes(situacaoAjustada!) &&
              _.semana! < this.semanaAtual &&
              _.ano! <= this.anoAtual
            );
          })
        );
        return;
      }
      this.descOP$.next(
        this.descOP.filter((_) => {
          return _.semana! < this.semanaAtual && _.ano! <= this.anoAtual;
        })
      );
    } else {
      this.semanaSelecionada = eventSemana.toString();
      this.descOP$.next(this.descOP.filter((_) => _.semana == eventSemana));
      if (this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => {
            let situacaoAjustada = _.DS_APONTAMENTO_DS?.includes('Parado')
              ? 'Parado'
              : _.DS_APONTAMENTO_DS;
            return (
              this.selectedApontamento.includes(situacaoAjustada!) &&
              _.semana == +this.semanaSelecionada &&
              _.ano! <= this.anoAtual
            );
          })
        );
      }
    }

    const descOPSubscription = this.descOP$.subscribe((x) => {
      // pega primeiro e último dia da semana para mostrar na toolbar
      this.getFirstAndLastWeekDay(x[0].previsao!);
      this.isEmptyList = !x.length;
      this.countOPs(x);
    });

    this.subscription.add(descOPSubscription);

    (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
    this.filtroAtivo = false;
  }

  openWindow(ref: string) {
    const buttonsConfig: NbWindowControlButtonsConfig = {
      minimize: false,
      maximize: false,
      fullScreen: false,
      close: true,
    };

    this.windowService.open(CarosselComponent, {
      context: { list: this.imgList.filter((i) => i.includes(ref)) },
      title: `Imagens`,
      buttons: buttonsConfig,
    });
  }

  // dropdown menu
  openMenu(opEnviada: descOP) {
    this.tempOP = opEnviada;
    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'auditor-list'),
        map(({ item: { title } }) => title)
      )
      .subscribe((title) => {
        this.counter++; // se tirar isso o menu abre mil vezes
        if (this.counter == 1) {
          this.openModal(title);
        }
      });
    this.counter = 0;
  }

  historicoAtraso(opEnviada: descOP) {
    this.tempOP = opEnviada;
    this.openModal('Histórico Apontamento');
  }

  openModal(tipo: string) {
    let ehApontamento = tipo == 'Apontamento de Produção';
    let ehPendencia = tipo == 'Pendências';
    let ehHistorico =
      tipo == 'Histórico Previsão' || tipo == 'Histórico Apontamento';
    let ehFichaTecnica = tipo == 'Download Ficha Técnica';

    if (ehFichaTecnica) {
      window.open(this.tempOP.link_ficha_tecnica, '_blank');
      this.toastrService.success('Download iniciado!', 'Ficha Técnica', {
        preventDuplicates: true,
      });
      return;
    }

    if (ehPendencia) {
      let codOp = this.tempOP.NR_REDUZIDOOP + '-' + this.tempOP.cd_local;
      this._router.navigate(['auditor/pendencias', codOp]);
      return;
    }
    if (ehHistorico) {
      this.NbDdialogService.open(DialogHistComponent, {
        context: {
          prevOP: this.tempOP,
          tipo: tipo,
        },
      });
      return;
    }

    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: this.tempOP,
        prev: this.tempOP.novaprevisao?.includes('Invalid')
          ? ''
          : this.tempOP.novaprevisao,
        i_motivo: this.tempOP.motivo_atraso,
        tipo: tipo,
        DS_APONTAMENTO_DS: this.tempOP.DS_APONTAMENTO_DS,
        apontamento: ehApontamento,
      },
    }).onClose.subscribe((x) => {
      console.log(x);
      if (ehApontamento) {
        this.tempOP.DS_APONTAMENTO_DS = x.DS_APONTAMENTO_DS;
      }
      if (!!x.prev && x.prev != '') {
        this.tempOP.novaprevisao = new Date(x.prev).toLocaleString('pt-Br', {
          timeZone: 'UTC',
        });
        this.tempOP.motivo_atraso = x.motivo;
        this.tempOP.checked = true;
      }
      if (x.removed) {
        this.tempOP.novaprevisao = '';
        this.tempOP.checked = false;
      }

      this.filtraMaiorMotivo(
        this.tempOP.NR_REDUZIDOOP + '-' + this.tempOP.cd_local
      );
      this.changeDetectorRef.detectChanges();
    });
  }

  countOPs(listOP: descOPs) {
    this.qntOPs = listOP.length;
    let opsFiltered: any[] = [];
    listOP.forEach((_) => {
      opsFiltered.push(_['qnt']);
    });
    this.qntPecas = opsFiltered.reduce((prev, cur) => {
      return parseInt(prev) + parseInt(cur);
    }, 0);
  }

  getFirstAndLastWeekDay(datePred: string) {
    const dataSeparada = datePred.split('/');
    let newDate = new Date(
      dataSeparada[1] + '/' + dataSeparada[0] + '/' + dataSeparada[2]
    );
    let dataSemana = new Date(newDate.getTime() - 4 * 86400000);

    this.dataIni = new Date(newDate.getTime() - dataSemana.getDay() * 86400000);
    this.dataFim = new Date(this.dataIni.getTime() + 6 * 86400000);
  }

  getWeek() {
    // pegar a semana atual
    let currentdate: Date = new Date();
    let oneJan: Date = new Date(currentdate.getFullYear(), 0, 1);
    let numberOfDays: number = Math.floor(
      (currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    this.semanaAtual =
      Math.floor((currentdate.getDay() + 1 + numberOfDays - 3) / 7) + 2;
    this.anoAtual = currentdate.getFullYear();

    this.semanaSelecionada = this.semanaAtual + '';
  }

  // lista de numero de semanas(por data da OP) da facção
  listWeeks(listOps: descOPs) {
    listOps.forEach((o) => {
      this.semanaList.push({ semana: o.semana!, ano: o.ano! });
      this.semanaList = [...new Set(this.semanaList)];
      // filtra as semanas do mesmo ano que são menores que
      let listAtrasoSemana = this.semanaList.filter(
        (_) => _.semana < this.semanaAtual && _.ano == this.anoAtual
      );
      let listAtrasoAno = this.semanaList.filter((_) => _.ano < this.anoAtual);
      let listAtraso = listAtrasoSemana.concat(listAtrasoAno);
      this.semanaListAtraso = listAtraso.flatMap((_) => _.semana);
      this.semanaListAtraso = [...new Set(this.semanaListAtraso)];
      this.semanaListAtraso.sort((a, b) => (a > b ? 1 : -1));

      let listFuturoSemana = this.semanaList.filter(
        (_) => _.semana > this.semanaAtual && _.ano == this.anoAtual
      );
      let listFuturoAno = this.semanaList.filter((_) => _.ano > this.anoAtual);
      let listFuturo = listFuturoSemana.concat(listFuturoAno);
      this.semanaListFuturo = [
        ...new Map(
          listFuturo.map((v) => [JSON.stringify([v.semana, v.ano]), v])
        ).values(),
      ];
      this.semanaListFuturo = [...new Set(this.semanaListFuturo)];
      this.semanaListFuturo.sort((a, b) =>
        (a.ano > b.ano ? true : a.semana > b.semana) ? 1 : -1
      );
    });
  }

  // verifica a semana mais proxima
  verifyClosestWeek() {
    let listClosest = this.semanaList
      .filter((_) => _.ano == this.anoAtual)
      .flatMap((_) => _.semana);
    if (listClosest.length > 0) {
      this.closestSemana = listClosest.reduce((a, b) => {
        let aDiff = Math.abs(a - parseInt(this.semanaSelecionada));
        let bDiff = Math.abs(b - parseInt(this.semanaSelecionada));

        if (aDiff == bDiff) {
          return a > b ? a : b;
        } else {
          return bDiff < aDiff ? b : a;
        }
      });
    }
    // troca semana atual para a mais proxima
    this.semanaSelecionada = this.closestSemana.toString();
  }

  verificaAcesso(): void {
    let userNivel = this._userService.getNivel();
    let userLogin = this._userService.getSession().login || '';

    if (this._datatableConstants.getUsuariosPendencias().length == 0) {
      const pendenciaServiceSubscription = this._pendenciasService
        .getUsuariosPendencias()
        .subscribe({
          next: (res) => {
            this._datatableConstants.setUsuariosPendencias(res);
            if (res.includes(userLogin)) {
              this.itemsMenu.push({ title: 'Pendências' });
            }
          },
          error: (err) => {
            throw new Error(err);
          },
        });

      !this.subscription
        ? (this.subscription = pendenciaServiceSubscription)
        : this.subscription.add(pendenciaServiceSubscription);
    }

    if (
      Pages[userNivel] == 'auditor' ||
      this._datatableConstants.getUsuariosPendencias().includes(userLogin)
    ) {
      this.itemsMenu.push({ title: 'Pendências' });
    }
  }

  ajustarTituloPagina(local: string) {
    let titulo = local;
    if (!this.isInterno) {
      titulo = this.removerTextoDesnecessario(titulo.trim());
    }
    this._setTitle.setTitle(titulo);
  }

  removerTextoDesnecessario(titulo: string) {
    return titulo
      .replace('COSTURA', '')
      .replace('CONSERTO', '')
      .replace('ESTAMPARIA', '')
      .replace('TERCEIROS', '');
  }

  openUrl(link: string) {
    window.open(link, '_blank');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

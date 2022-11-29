import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NbDialogService,
  NbMenuService,
  NbWindowControlButtonsConfig,
  NbWindowService,
} from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
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
import { UserService } from 'src/app/services/user.service';
import { CarosselComponent } from 'src/app/shared/components/carossel/carossel.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';
import { environment } from 'src/environments/environment';

const usuarios_pendencias = environment.usuarios_pendencias;

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoFaccaoComponent implements OnInit {
  datePipe = new DatePipe('pt-Br');
  selectedApontamento: string[] = [];
  idSelectedApontamento: number[] = [];
  apontamentoEnum = ApontamentoList;
  menuApontamento: string[] = [];
  title = '';
  isDistribuicao = false;
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

  semanaAtual: string = '0';
  semanaAtualNumber: number = 0;
  semanaSelecionada: string = '0';
  closestSemana: number = 0;
  semanaList: number[] = [];
  semanaListAtraso: number[] = [];
  semanaListFuturo: number[] = [];

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

  itemsMenu = [
    { title: 'Atraso' },
    { title: 'Adiantamento' },
    { title: 'Apontamento de Produção' },
  ];

  constructor(
    private NbDdialogService: NbDialogService,
    private windowService: NbWindowService,
    private changeDetectorRef: ChangeDetectorRef,
    private nbMenuService: NbMenuService,
    public _loadingService: LoadingService,
    private _setTitle: SetTitleServiceService,
    private _opsFilteredService: OpsFilteredService,
    private _opsService: OpsService,
    private _atrasoService: AtrasoService,
    private _apontamentoService: ApontamentoService,
    private _userService: UserService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    // #################--- TEMPORÁRIO ---#################

    let userNivel = this._userService.getNivel();
    this.routeId = this._route.snapshot.paramMap.get('id')!;
    this.isDistribuicao = this.routeId == '302';
    this.isUsuario = userNivel == 5;

    // isDistribuicao
    let usuarioName = this._userService.getSession().login;
    console.log(usuarioName);

    if (Pages[userNivel] == 'fornecedor') {
      this.itemsMenu = [{ title: 'Apontamento de Produção' }];
    }
    if (
      usuarios_pendencias.includes(usuarioName!) ||
      Pages[userNivel] == 'auditor'
    ) {
      this.itemsMenu.push({ title: 'Pendências' });
    }

    // ####################################################

    // pega o filtro setado na página anterior (escolha da facção)
    let filtroColecao: string[] = this._opsFilteredService.getFilter().colecao;

    // pegar a semana atual
    let currentdate: Date = new Date();
    let oneJan: Date = new Date(currentdate.getFullYear(), 0, 1);
    let numberOfDays: number = Math.floor(
      (currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    this.semanaAtual = (
      Math.floor((currentdate.getDay() + 1 + numberOfDays - 3) / 7) + 2
    ).toString();

    this.semanaSelecionada = this.semanaAtual;
    this.semanaAtualNumber = parseInt(this.semanaAtual);

    this._setTitle.setTitle('Carregando...');
    // pega todos os dados da tabela de alterações

    // se tiver dados no cache utiliza
    const getDataFromSession = this._opsService.getSessionData();
    if (this.routeId == '302' && !!getDataFromSession.length) {
      this.listOPs = getDataFromSession.filter((op) => {
        return op.CD_LOCAL == parseInt(this.routeId);
      });
      this.ajusteDosDados(filtroColecao, this.listOPs);
      return;
    }

    this._apontamentoService
      .getApontamento(this.routeId)
      .subscribe((apontamentos: any) => {
        apontamentos = JSON.parse(apontamentos.data).filter(
          (apontamentoBase: { CD_LOCAL: string }) =>
            apontamentoBase.CD_LOCAL + '' == this.routeId
        );

        let situacaoEnum = Object.values(ApontamentoList).filter(
          (value) => typeof value === 'string'
        );
        for (let [i, item] of situacaoEnum.entries()) {
          this.menuApontamento.push(item as string);
        }

        this.apontamentoList = apontamentos;
        this._atrasoService.getMotivos(this.routeId).subscribe((motivo: { data: string; }) => {
          this.motivoList = JSON.parse(motivo.data);

          if (!!getDataFromSession.length) {
            this.listOPs = getDataFromSession.filter((op) => {
              return op.CD_LOCAL == parseInt(this.routeId);
            });
            this.ajusteDosDados(filtroColecao, this.listOPs);
          } else {
            this._opsService.getOpByLocal(this.routeId).subscribe({
              next: (ops) => {
                ops = JSON.parse(ops.data);
                ops[0].DS_LOCAL = ops[0].DS_LOCAL.replace('EXT. ', '');
                this.isDistribuicao = ops[0].DS_LOCAL.split('. ')[0] == 'INT';
                if (this.isDistribuicao || this.isUsuario) {
                  this.showMenu.next(false);
                }

                this.ajusteDosDados(filtroColecao, ops);
              },
              error: (e) => {
                console.error(e);
                this._setTitle.setTitle('Erro');
                this.loadingError = true;
              },
            });
          }
        });
      });
  }

  ngAfterContentInit() {
    this.descOP$.next(this.descOP);
  }

  trackByOP(_index: number, op: { NR_REDUZIDOOP: number }) {
    return op.NR_REDUZIDOOP;
  }

  ajusteDosDados(filtroColecao: string[], ops: OPs): void {
    if (filtroColecao.length > 0) {
      ops = ops.filter((op) => {
        return filtroColecao.includes(op.NR_CICLO + '');
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
      prevdate =
        prevdate.toLocaleString() == 'Invalid Date'
          ? new Date('01/01/2001')
          : prevdate;
      let prev =
        prevdate.toLocaleString() != 'Invalid Date'
          ? prevdate.toLocaleString('pt-br').substring(0, 10)
          : '01/01/2001';

      // pega semana da op
      let oneJan = new Date(prevdate.getFullYear(), 0, 1);
      let numberOfDays = Math.floor(
        (prevdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
      );
      let prevSemana = 0;

      if (prevdate.toLocaleString('pt-br').substring(0, 10) != '01/01/2001') {
        if (prevdate.getDay() === 0) {
          prevSemana =
            Math.floor((prevdate.getDay() + 1 + numberOfDays) / 7) + 2;
        } else {
          prevSemana =
            Math.abs(
              Math.floor((prevdate.getDay() + 1 + numberOfDays - 3) / 7)
            ) + 2;
        }
      }

      this.descOP.push({
        semana: prevSemana,
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
        entrada: op.DT_ENTRADA,
        DS_APONTAMENTO_DS:
          maiorApontamento.DS_APONTAMENTO_DS || 'Não informado',
        CD_ATRASO: maiorMotivo.cd_atraso,
        novaprevisao: this.datePipe.transform(
          maiorMotivo.dt_atraso,
          'dd/MM/yyyy'
        )!,
        motivo_atraso: maiorMotivo.ds_atraso,
        checked: maiorMotivo.i_checked,
        descricao: op.DS_GRUPO,
        drop: op.DS_DROP,
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
      });

      this.descOP.map((desc) => {
        switch (desc.status) {
          case 'Em andamento':
            desc.accent = 'success';
            break;
          case 'Pendente':
            desc.accent = 'warning';
            break;
          case 'Em atraso':
            desc.accent = 'danger';
            break;
          default:
            desc.accent = 'basic';
        }
      });
    });

    // lista de numero de semanas(por data da OP) da facção
    this.descOP.forEach((o) => {
      this.semanaList.push(o.semana!);
      this.semanaList = [...new Set(this.semanaList)];

      this.semanaListAtraso = this.semanaList.filter(
        (_) => _ < this.semanaAtualNumber
      );
      this.semanaListAtraso.sort((a, b) => (a > b ? 1 : -1));
      this.semanaListFuturo = this.semanaList.filter(
        (_) => _ > this.semanaAtualNumber
      );
      this.semanaListFuturo.sort((a, b) => (a > b ? 1 : -1));
    });

    // verifica a semana mais proxima
    this.closestSemana = this.semanaList.reduce((a, b) => {
      let aDiff = Math.abs(a - parseInt(this.semanaSelecionada));
      let bDiff = Math.abs(b - parseInt(this.semanaSelecionada));

      if (aDiff == bDiff) {
        return a > b ? a : b;
      } else {
        return bDiff < aDiff ? b : a;
      }
    });

    // troca semana atual para a mais proxima
    this.semanaSelecionada = this.closestSemana.toString();

    this.title = this.descOP[0].local
      .replace('COSTURA', '')
      .replace('CONSERTO', '')
      .replace('ESTAMPARIA', '')
      .replace('TERCEIROS', '');
    this._setTitle.setTitle(this.title);

    // se distribuição, ordenar por entrada
    if (this.isDistribuicao) {
      this.ordenarMenor();
    }
    this.descOP$.next(this.descOP);
    this.descOPLoad.next(!this.descOP.length);
    // filtra somente a semana atual
    this.filtraSemana(parseInt(this.semanaSelecionada));
  }

  ordenarMenor(): void {
    this.descOP.sort((a, b) => {
      let dateA = new Date(a.entrada! || '0');
      let dateB = new Date(b.entrada! || '0');
      let result = dateA > dateB ? 1 : dateB > dateA ? -1 : 0;

      return result;
    });
    this.descOP$.next(this.descOP);
  }
  ordenarMaior(): void {
    this.descOP.sort((a, b) => {
      let dateA = new Date(a.entrada! || '0');
      let dateB = new Date(b.entrada! || '0');
      let result = dateA < dateB ? 1 : dateB < dateA ? -1 : 0;

      return result;
    });
    this.descOP$.next(this.descOP);
  }

  filtraMaiorMotivo(cod: string) {
    if (this.motivoList) {
      let erro = this.motivoList.toString() == 'error';
      if (!erro) {
        let motivos = this.motivoList.filter(
          (m) => m.NR_REDUZIDOOP + '-' + m.CD_LOCAL == cod
        );
        if (motivos.length > 0) {
          this.motivo = motivos.reduce((p, c) => {
            return p.ID_NOVO_MOTIVO! > c.ID_NOVO_MOTIVO! ? p : c;
          });
          return {
            cd_atraso: this.motivo.CD_ATRASO,
            ds_atraso: this.motivo.DS_ATRASO_DS,
            dt_atraso: +this.motivo.DT_PREV_RETORNO_NOVA + 10800000,
            i_checked: true,
          };
        }
        return { cd_atraso: 0, ds_atraso: '', dt_atraso: '', i_checked: false };
      }
    }
    return { cd_atraso: 0, ds_atraso: '', dt_atraso: '', i_checked: false };
  }

  filtraMaiorApontamento(cod: string) {
    if (this.apontamentoList) {
      let erro = this.apontamentoList.toString() == 'error';
      if (!erro) {
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
        return { ds_atraso: '', dt_atraso: '', i_checked: false };
      }
    }
    return { ds_atraso: '', dt_atraso: '', i_checked: false };
  }

  filtroOP(event: Event): void {
    document.getElementById('filtro-op')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
    this.idSelectedApontamento = [];
    if (filterValue == '') {
      this.filtroAtivo = false;
      this.descOP$.next(this.descOP);
      if (this.semanaSelecionada != 'Todas') {
        this.descOP$.next(
          this.descOP.filter(
            (_) => _.semana == parseInt(this.semanaSelecionada)
          )
        );
      }
    } else {
      this.filtroAtivo = true;
      if (this.semanaSelecionada != 'Todas') {
        this.descOP$.next(
          this.descOP.filter(
            (_) =>
              _.cod?.includes(filterValue.toUpperCase()) &&
              _.semana == parseInt(this.semanaSelecionada)
          )
        );
      } else {
        this.descOP$.next(
          this.descOP.filter((_) => _.cod?.includes(filterValue.toUpperCase()))
        );
      }
      this.descOP$.subscribe((x) => {
        this.isEmptyList = !x.length;
        this.countOPs(x);
      });
    }
  }

  filtrosDropdown() {
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
    this.descOP$.subscribe((x) => {
      this.isEmptyList = !x.length;
      this.countOPs(x);
    });
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.descOP$.next(this.descOP);
    if (this.semanaSelecionada != 'Todas') {
      this.descOP$.next(
        this.descOP.filter((_) => _.semana == parseInt(this.semanaSelecionada))
      );
    }
  }

  filtraSemana(event: number, reset?: boolean) {
    this.qntOPs = 0;
    this.qntPecas = 0;
    if (reset) {
      this.semanaSelecionada = '';
    }
    if (event == -1) {
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
    } else {
      this.semanaSelecionada = event.toString();
      this.descOP$.next(this.descOP.filter((_) => _.semana == event));
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
      this.descOP$.subscribe((x) => {
        // pega primeiro e último dia da semana para mostrar na toolbar
        this.getFirstAndLastWeekDay(x[0].previsao);

        this.isEmptyList = !x.length;
        this.countOPs(x);
      });

      (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
      this.filtroAtivo = false;
    }
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
          this.open(title);
        }
      });
    this.counter = 0;
  }

  open(tipo: string) {
    let ehApontamento = tipo == 'Apontamento de Produção';
    let ehPendencia = tipo == 'Pendências';

    if (ehPendencia) {
      let codOp =
      this.tempOP.NR_REDUZIDOOP +'-'+
      this.tempOP.cd_local;
      this._router.navigate(['auditor/pendencias', codOp]);
      return;
    }

    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: this.tempOP,
        prev: this.tempOP.novaprevisao,
        i_motivo: this.tempOP.motivo_atraso,
        tipo: tipo,
        DS_APONTAMENTO_DS: this.tempOP.DS_APONTAMENTO_DS,
        apontamento: ehApontamento,
      },
    }).onClose.subscribe((x) => {
      if (ehApontamento) {
        this.tempOP.DS_APONTAMENTO_DS = x.DS_APONTAMENTO_DS;
      }
      if (!!x.prev) {
        this.tempOP.novaprevisao = this.datePipe.transform(
          x.prev,
          'dd/MM/yyyy'
        )!;
        this.tempOP.motivo_atraso = x.motivo;
        this.tempOP.checked = true;
      }
      if (x.removed) {
        this.tempOP.novaprevisao = '';
        this.tempOP.checked = false;
      }

      this.filtraMaiorMotivo(this.tempOP.NR_REDUZIDOOP +'-'+ this.tempOP.cd_local);
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
    // pegar o primeiro e último dia da semana
    let dia = datePred.substring(0, 2);
    let mes = datePred.substring(3, 5);
    let ano = datePred.substring(6, 10);
    let newDate = new Date(mes + '/' + dia + '/' + ano);
    let dataSemana = new Date(newDate.getTime() - 4 * 86400000);

    this.dataIni = new Date(newDate.getTime() - dataSemana.getDay() * 86400000);
    this.dataFim = new Date(this.dataIni.getTime() + 6 * 86400000);
  }

  openUrl(link: string) {
    window.open(link, '_blank');
  }

  scrollTop() {
    var container = document.querySelector('#top-page')! as HTMLElement;
    container.scrollIntoView();
  }
}

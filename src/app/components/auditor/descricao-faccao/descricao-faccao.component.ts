import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { Motivo, Motivos } from 'src/app/models/motivo';
import { OP, OPs } from 'src/app/models/ops';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsFilteredService } from 'src/app/services/ops-filtered.service';
import { OpsService } from 'src/app/services/ops.service';
import { CarosselComponent } from 'src/app/shared/components/carossel/carossel.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescricaoFaccaoComponent implements OnInit {

  selectedApontamento: string[] = [];
  menuApontamento: string[] = [];

  counter: number = 0;
  defaultImage = '../../../../assets/not-found.png';
  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';
  loadingError: boolean = false;
  isEmptyList: boolean = false;
  filtroAtivo: boolean = false;

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

  listOPs!: OPs;
  tempOP!: descOP;
  descOPLoad = new BehaviorSubject<boolean>(true);
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  motivoList!: Motivos;
  motivo!: Motivo;
  apontamentoList!: Apontamentos;
  apontamento!: Apontamento;
  imgList: string[] = [];

  items = [
    { title: 'Atraso' },
    { title: 'Adiantamento' },
    { title: 'Apontamento de Produção' },
  ];

  constructor(
    private _setTitle: SetTitleServiceService,
    private _opsFilteredService: OpsFilteredService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private NbDdialogService: NbDialogService,
    private windowService: NbWindowService,
    private changeDetectorRef: ChangeDetectorRef,
    private nbMenuService: NbMenuService,
    public _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
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
    this._auditorService.getApontamento().subscribe((apontamentos) => {

      this.menuApontamento.push('Não informado');
      apontamentos.forEach((x) => {
        this.menuApontamento.push(x.Situacao!);
        this.menuApontamento = [...new Set(this.menuApontamento)];
      });

      this.menuApontamento.sort((a,b) => a > b ? 1 : b > a ? -1 : 0);

      this.apontamentoList = apontamentos;
      this._auditorService.getMotivos().subscribe((motivo) => {
        this.motivoList = motivo;

        let id = this._route.snapshot.paramMap.get('id')!;
        this._opsService.getOpById(id).subscribe({
          next: (ops: OPs) => {
            if (filtroColecao.length > 0) {
              ops = ops.filter((x) => {
                return filtroColecao.includes(x.DS_CICLO)
              });
            }
            ops.sort((a, b) => {
              let dataRetornoA = `${a.PREV_RETORNO.substring(
                6,
                10
              )}-${a.PREV_RETORNO.substring(3, 5)}-${a.PREV_RETORNO.substring(
                0,
                2
              )}`;
              let dataRetornoB = `${b.PREV_RETORNO.substring(
                6,
                10
              )}-${b.PREV_RETORNO.substring(3, 5)}-${b.PREV_RETORNO.substring(
                0,
                2
              )}`;

              let x = new Date(dataRetornoA);
              let y = new Date(dataRetornoB);

              if (x > y) {
                return 1;
              } else if (y > x) {
                return -1;
              } else {
                return 0;
              }
            });

            let imgListAll: string[] = [];
            let maiorMotivo;
            let maiorApontamento;

            ops.map((op: OP) => {
              op.DT_ENTRADA = `${op.DT_ENTRADA.substring(
                6,
                10
              )}-${op.DT_ENTRADA.substring(3, 5)}-${op.DT_ENTRADA.substring(
                0,
                2
              )} 04:00:00`;
              op.PREV_RETORNO = `${op.PREV_RETORNO.substring(
                6,
                10
              )}-${op.PREV_RETORNO.substring(3, 5)}-${op.PREV_RETORNO.substring(
                0,
                2
              )} 04:00:00`;

              let newImage = new Image();
              newImage.src =
                this.imgUrl +
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
                  this.imgUrl +
                    op.CD_REFERENCIA.toString() +
                    '/' +
                    op.CD_REFERENCIA.toString() +
                    '-' +
                    j +
                    '.jpg'
                );
                this.imgList = [...new Set(imgListAll)];
              }

              maiorMotivo = this.filtraMaiorMotivo(op.cod!);
              maiorApontamento = this.filtraMaiorApontamento(op.cod!);

              let prevdate = new Date(op.PREV_RETORNO);
              let prev = prevdate
                ? prevdate.toLocaleString('pt-br').substring(0, 10)
                : '01/01/2001';

              // pega semana da op
              let oneJan = new Date(prevdate.getFullYear(), 0, 1);
              let numberOfDays = Math.floor(
                (prevdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
              );
              let prevSemana = 0;
              if (prevdate.getDay() === 0) {
                prevSemana =
                  Math.floor((prevdate.getDay() + 1 + numberOfDays) / 7) + 2;
              } else {
                prevSemana =
                  Math.abs(
                    Math.floor((prevdate.getDay() + 1 + numberOfDays - 3) / 7)
                  ) + 2;
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
                ref: op.CD_REFERENCIA,
                previsao: prev,
                Situacao: maiorApontamento.situacao || 'Não informado',
                novaprevisao: maiorMotivo.dt_atraso,
                motivo_atraso: maiorMotivo.ds_atraso,
                checked: maiorMotivo.i_checked,
                descricao: op.DS_GRUPO,
                drop: op.DS_DROP,
                img:
                  this.imgUrl +
                  op.CD_REFERENCIA.toString() +
                  '/' +
                  op.CD_REFERENCIA.toString() +
                  '-1.jpg',
                status: op.Status,
                status_color: op.Status.toLowerCase().replace(' ', '-'),
                qnt: op.QT_OP,
              });
              this.descOP.map((desc) => {
                if (desc.status == 'Em andamento') {
                  desc.accent = 'success';
                } else if (desc.status == 'Pendente') {
                  desc.accent = 'warning';
                } else if (desc.status == 'Em atraso') {
                  desc.accent = 'danger';
                } else {
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
              this.semanaListFuturo = this.semanaList.filter(
                (_) => _ > this.semanaAtualNumber
              );
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

            let title = this.descOP[0].local
              .replace('COSTURA', '')
              .replace('CONSERTO', '')
              .replace('ESTAMPARIA', '')
              .replace('TERCEIROS', '');
            this._setTitle.setTitle(title);
            this.descOP$.next(this.descOP);
            this.descOPLoad.next(!this.descOP.length);
            // filtra somente a semana atual
            this.filtraSemana(parseInt(this.semanaSelecionada));
          },
          error: (e) => {
            console.error(e);
            this._setTitle.setTitle('Erro');
            this.loadingError = true;
          },
        });
      });
    });
  }

  ngAfterContentInit() {
    this.descOP$.next(this.descOP);
  }

  trackByOP(_index: number, op: { cod: string }) {
    return op.cod;
  }

  filtraMaiorMotivo(cod: string) {
    if (this.motivoList) {
      let erro = this.motivoList.toString() == 'error';
      if (!erro) {
        let motivos = this.motivoList.filter((m) => m.cod == cod);
        if (motivos.length > 0) {
          this.motivo = motivos.reduce((p, c) => {
            return p.ID_NOVO_MOTIVO! > c.ID_NOVO_MOTIVO! ? p : c;
          });
          return {
            ds_atraso: this.motivo.MOTIVO,
            dt_atraso: this.motivo.NOVA_PREVISAO,
            i_checked: true,
          };
        }
        return { ds_atraso: '', dt_atraso: '', i_checked: false };
      }
    }
    return { ds_atraso: '', dt_atraso: '', i_checked: false };
  }
  filtraMaiorApontamento(cod: string) {
    if (this.apontamentoList) {
      let erro = this.apontamentoList.toString() == 'error';
      if (!erro) {
        let apontamentos = this.apontamentoList.filter(
          (m) => m.cod == cod
        );
        if (apontamentos.length > 0) {
          this.apontamento = apontamentos.reduce((p, c) => {
            return p.ID_NOVA_SITUACAO! > c.ID_NOVA_SITUACAO! ? p : c;
          });
          return {
            situacao: this.apontamento.Situacao,
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
    this.selectedApontamento = [];
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
              _.cod.includes(filterValue.toUpperCase()) &&
              _.semana == parseInt(this.semanaSelecionada)
          )
        );
      } else {
        this.descOP$.next(
          this.descOP.filter((_) => _.cod.includes(filterValue.toUpperCase()))
        );
      }
      this.descOP$.subscribe((x) => {
        this.isEmptyList = !x.length;
        this.countOPs(x);
      });
    }
  }

  filtrosDropdown() {
    this.filtroAtivo = false;
    (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
    if (this.semanaSelecionada != 'Todas') {
      this.descOP$.next(this.descOP.filter((_) => _.semana == parseInt(this.semanaSelecionada)));
      if(this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => this.selectedApontamento.includes(_.Situacao!) && _.semana == parseInt(this.semanaSelecionada))
        );
      }
    } else {
      this.descOP$.next(this.descOP);
      if(this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => this.selectedApontamento.includes(_.Situacao!))
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
    if (event == 0) {
      this.semanaSelecionada = 'Todas';
      (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
      this.descOP$.next(this.descOP);
      if(this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => this.selectedApontamento.includes(_.Situacao!))
        );
      }
    } else {
      this.semanaSelecionada = event.toString();
      this.descOP$.next(this.descOP.filter((_) => _.semana == event));
      if(this.selectedApontamento.length != 0) {
        this.descOP$.next(
          this.descOP.filter((_) => this.selectedApontamento.includes(_.Situacao!) && _.semana == parseInt(this.semanaSelecionada))
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
    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: this.tempOP,
        prev: this.tempOP.novaprevisao,
        i_motivo: this.tempOP.motivo_atraso,
        tipo: tipo,
        situacao: this.tempOP.Situacao,
        apontamento: ehApontamento,
      },
    }).onClose.subscribe((x) => {
      if (ehApontamento) {
        this.tempOP.Situacao = x.situacao;
      }
      if (!!x.prev) {
        this.tempOP.novaprevisao = x.prev;
        this.tempOP.motivo_atraso = x.motivo;
        this.tempOP.checked = true;
      }
      if (x.removed) {
        this.tempOP.novaprevisao = '';
        this.tempOP.checked = false;
      }

      this.filtraMaiorMotivo(this.tempOP.cod);
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
}
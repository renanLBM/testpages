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
import { descOP } from 'src/app/models/descOP';
import { Motivo, Motivos } from 'src/app/models/motivo';
import { OPs } from 'src/app/models/ops';
import { AuditorService } from 'src/app/services/auditor.service';
import { LoadingService } from 'src/app/services/loading.service';
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
  counter: number = 0;
  defaultImage = '../../../../assets/not-found.png';
  loadingError: boolean = false;
  emptyList: boolean = false;
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
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  motivoList!: Motivos;
  motivo!: Motivo;
  imgList: string[] = [];

  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  items = [{ title: 'Atraso' }, { title: 'Adiantamento' }];

  constructor(
    private _setTitle: SetTitleServiceService,
    public _loadingService: LoadingService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private NbDdialogService: NbDialogService,
    private windowService: NbWindowService,
    private changeDetectorRef: ChangeDetectorRef,
    private nbMenuService: NbMenuService
  ) {}

  ngOnInit(): void {
    // pegar a semana atual
    let currentdate = new Date();
    let oneJan = new Date(currentdate.getFullYear(), 0, 1);
    let numberOfDays = Math.floor(
      (currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
    );
    this.semanaAtual = Math.ceil(
      (currentdate.getDay() + 1 + numberOfDays) / 7
    ).toString();
    this.semanaSelecionada = this.semanaAtual;
    this.semanaAtualNumber = parseInt(this.semanaAtual);

    this._setTitle.setTitle('Carregando...');
    // pega todos os dados da tabela de alterações
    this._auditorService.getMotivos().subscribe((motivo) => {
      this.motivoList = motivo;

      let id = this._route.snapshot.paramMap.get('id')!;
      this._opsService.getOpById(id).subscribe({
        next: (x) => {
          x.sort((a, b) => {
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
          let maior;

          x.map((i) => {
            i.DT_ENTRADA = `${i.DT_ENTRADA.substring(
              6,
              10
            )}-${i.DT_ENTRADA.substring(3, 5)}-${i.DT_ENTRADA.substring(
              0,
              2
            )} 04:00:00`;
            i.PREV_RETORNO = `${i.PREV_RETORNO.substring(
              6,
              10
            )}-${i.PREV_RETORNO.substring(3, 5)}-${i.PREV_RETORNO.substring(
              0,
              2
            )} 04:00:00`;

            let newImage = new Image();
            newImage.src =
              this.imgUrl +
              i.CD_REFERENCIA.toString() +
              '/' +
              i.CD_REFERENCIA.toString() +
              '-1.jpg';

            newImage.onerror = () => {
              this.imgList = this.imgList.filter(
                (im) => !im.includes(i.CD_REFERENCIA.toString())
              );
            };

            for (let j = 1; j <= 13; j++) {
              imgListAll.push(
                this.imgUrl +
                  i.CD_REFERENCIA.toString() +
                  '/' +
                  i.CD_REFERENCIA.toString() +
                  '-' +
                  j +
                  '.jpg'
              );
              this.imgList = [...new Set(imgListAll)];
            }

            maior = this.filtraMaior(i.CD_REFERENCIA);

            let prevdate = new Date(i.PREV_RETORNO);
            let prev = prevdate
              ? prevdate.toLocaleString('pt-br').substring(0, 10)
              : '01/01/2001';

            // pega semana da op
            let oneJan = new Date(prevdate.getFullYear(), 0, 1);
            let numberOfDays = Math.floor(
              (prevdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
            );
            let prevSemana = Math.ceil(
              (prevdate.getDay() + 1 + numberOfDays) / 7
            );

            this.descOP.push({
              semana: prevSemana,
              cd_local: i.CD_LOCAL,
              local: i.DS_LOCAL,
              cod:
                i.NR_CICLO.toString() +
                '-' +
                i.NR_OP.toString() +
                '-' +
                i.CD_REFERENCIA.toString(),
              ciclo: i.NR_CICLO,
              op: i.NR_OP,
              ref: i.CD_REFERENCIA,
              previsao: prev,
              novaprevisao: maior.dt_atraso,
              motivo_atraso: maior.ds_atraso,
              checked: maior.i_checked,
              descricao: i.DS_GRUPO,
              drop: i.DS_DROP,
              img:
                this.imgUrl +
                i.CD_REFERENCIA.toString() +
                '/' +
                i.CD_REFERENCIA.toString() +
                '-1.jpg',
              status: i.Status,
              status_color: i.Status.toLowerCase().replace(' ', '-'),
              qnt: i.QT_OP,
            });
            this.descOP.map((op) => {
              if (op.status == 'Em andamento') {
                op.accent = 'success';
              } else if (op.status == 'Pendente') {
                op.accent = 'warning';
              } else if (op.status == 'Em atraso') {
                op.accent = 'danger';
              } else {
                op.accent = 'basic';
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
  }

  ngAfterContentInit() {
    this.descOP$.next(this.descOP);
  }

  trackByOP(_index: number, op: { cod: string }) {
    return op.cod;
  }

  filtraMaior(ref: number) {
    if (this.motivoList) {
      let erro = this.motivoList.toString() == 'error';
      if (!erro) {
        let motivos = this.motivoList.filter((m) => m.CD_REFERENCIA == ref);
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

  filtroOP(event: Event): void {
    document.getElementById('filtro')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;
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
        this.emptyList = !x.length;
        let dia = new Date(x[0].previsao).getDay();
        // this.dataIni = dia.getDay()
        // this.dataFim =
      });
    }
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
    if (reset) {
      this.semanaSelecionada = '';
    }
    if (event == 0) {
      this.semanaSelecionada = 'Todas';
      (document.getElementById('filtro') as HTMLInputElement)!.value = '';
      this.descOP$.next(this.descOP);
    } else {
      this.descOP$.next(this.descOP.filter((_) => _.semana == event));
      this.descOP$.subscribe((x) => {
        // pega primeiro e último dia da semana para mostrar na toolbar
        this.getFirsAndLastWeekDay(x[0].previsao);

        this.emptyList = !x.length;
        this.qntOPs = x.length;
        let opsFiltered: any[] = [];
        x.forEach((_) => {
          opsFiltered.push(_['qnt']);
        });
        this.qntPecas = opsFiltered.reduce((prev, cur) => {
          return parseInt(prev) + parseInt(cur);
        }, 0);
      });

      (document.getElementById('filtro') as HTMLInputElement)!.value = '';
      this.filtroAtivo = false;
      this.semanaSelecionada = event.toString();
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
  openMenu(item: descOP) {
    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'auditor-list'),
        map(({ item: { title } }) => title)
      )
      .subscribe((title) => {
        this.counter++;
        if (this.counter == 1) {
          this.open(item, title);
        }
      });
    this.counter = 0;
  }

  open(item: descOP, tipo: string) {
    this.counter++;
    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: item,
        prev: item.novaprevisao,
        i_motivo: item.motivo_atraso,
        tipo: tipo
      },
    }).onClose.subscribe((x) => {
      if (!!x.prev) {
        item.novaprevisao = x.prev;
        item.motivo_atraso = x.motivo;
        item.checked = true;
      }
      if (x.removed) {
        item.novaprevisao = '';
        item.checked = false;
      }

      this.filtraMaior(item.ref);
      this.changeDetectorRef.detectChanges();
    });
  }

  getFirsAndLastWeekDay(datePred: string) {
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

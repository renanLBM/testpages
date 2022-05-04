import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NbDialogService,
  NbWindowControlButtonsConfig,
  NbWindowService,
} from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
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
  defaultImage = '../../../../assets/not-found.png';
  emptyList: boolean = false;
  loadingError: boolean = false;

  qntOPs: number = 0;
  qntPecas: number = 0;
  semanaAtual: string = '0';
  semanaList: number[] = [];
  filtroAtivo: boolean = false;
  listOPs!: OPs;
  descOP: descOP[] = [];
  descOP$: BehaviorSubject<descOP[]> = new BehaviorSubject(this.descOP);

  motivoList!: Motivos;
  motivo!: Motivo;
  imgList: string[] = [];

  imgUrl = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  constructor(
    private _setTitle: SetTitleServiceService,
    public _loadingService: LoadingService,
    private _opsService: OpsService,
    private _auditorService: AuditorService,
    private _route: ActivatedRoute,
    private NbDdialogService: NbDialogService,
    private windowService: NbWindowService,
    private changeDetectorRef: ChangeDetectorRef
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

    this._setTitle.setTitle('Carregando...');
    // pega todos os dados da tabela de alterações
    this._auditorService.getMotivos().subscribe((motivo) => {
      this.motivoList = motivo;

      let id = this._route.snapshot.paramMap.get('id')!;
      this._opsService.getOpById(id).subscribe({
        next: (x) => {
          x.sort((a, b) => {
            let x = new Date(a.PREV_RETORNO);
            let y = new Date(b.PREV_RETORNO);

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

          x.forEach((i) => {
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

            let prev = new Date(i.PREV_RETORNO)
              .toLocaleString('pt-br')
              .substring(0, 10);

            // pega semana da op
            let prevdate = new Date(i.PREV_RETORNO);
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
          });

          // verifica a semana mais proxima
          let closestSemana = this.semanaList.reduce((a, b) => {
            let aDiff = Math.abs(a - parseInt(this.semanaAtual));
            let bDiff = Math.abs(b - parseInt(this.semanaAtual));

            if (aDiff == bDiff) {
              return a > b ? a : b;
            } else {
              return bDiff < aDiff ? b : a;
            }
          });

          // troca semana atual para a mais proxima
          this.semanaAtual = closestSemana.toString();

          let title = this.descOP[0].local
            .replace('COSTURA', '')
            .replace('ESTAMPARIA', '')
            .replace('TERCEIROS', '');
          this._setTitle.setTitle(title);
          this.descOP$.next(this.descOP);
          // filtra somente a semana atual
          this.filtraSemana(parseInt(this.semanaAtual));
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
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue == '') {
      this.filtroAtivo = false;
      this.descOP$.next(this.descOP);
    } else {
      this.filtroAtivo = true;
      this.descOP$.next(
        this.descOP.filter(
          (_) =>
            _.cod.includes(filterValue.toUpperCase()) &&
            _.semana == parseInt(this.semanaAtual)
        )
      );
      this.descOP$.subscribe((x) => (this.emptyList = !x.length));
    }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.descOP$.next(
      this.descOP.filter((_) => _.semana == parseInt(this.semanaAtual))
    );
  }

  filtraSemana(event: number, item?: HTMLInputElement) {
    if (event == 0) {
      this.descOP$.next(this.descOP);
    } else {
      this.descOP$.next(this.descOP.filter((_) => _.semana == event));
      this.descOP$.subscribe((x) => {
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

  open(item: descOP) {
    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: item,
        prev: item.novaprevisao,
        i_motivo: item.motivo_atraso,
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
}

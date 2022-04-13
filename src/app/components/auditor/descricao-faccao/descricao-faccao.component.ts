import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NbComponentStatus,
  NbDialogService,
  NbWindowControlButtonsConfig,
  NbWindowService,
} from '@nebular/theme';
import { Subject } from 'rxjs';
import { descOP } from 'src/app/models/descOP';
import { OPs } from 'src/app/models/ops';
import { LoadingService } from 'src/app/services/loading.service';
import { OpsService } from 'src/app/services/ops.service';
import { CarosselComponent } from 'src/app/shared/components/carossel/carossel.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
})
export class DescricaoFaccaoComponent implements OnInit {
  err: string[] = [];
  defaultImage = '../../../../assets/not-found.png';

  filtroAtivo: boolean = false;
  listOPs!: OPs;
  descOP: descOP[] = [];
  descOP$: Subject<descOP[]> = new Subject();
  datas: any[] = [];
  imgList: string[] = [];

  basic_accent: NbComponentStatus = 'basic';

  img_url = 'https://indicium-lbm-client.s3-sa-east-1.amazonaws.com/images/';

  binding = false;

  constructor(
    public _loadingService: LoadingService,
    private _opsService: OpsService,
    private _route: ActivatedRoute,
    private NbDdialogService: NbDialogService,
    private windowService: NbWindowService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    let id = this._route.snapshot.paramMap.get('id')!;
    this._opsService.getOpById(id).subscribe((x) => {
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
      let img: string = '';

      x.forEach((i) => {
        for (let j = 1; j <= 13; j++) {
          img =
            this.img_url +
            i.CD_REFERENCIA.toString() +
            '/' +
            i.CD_REFERENCIA.toString() +
            '-' +
            j +
            '.jpg';

          imgListAll.push(img);
          this.imgList = [...new Set(imgListAll)];
        }

        let prev = new Date(i.PREV_RETORNO)
          .toLocaleString('pt-br')
          .substring(0, 10);
        this.descOP.push({
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
          novaprevisao: '',
          checked: false,
          descricao: i.DS_GRUPO,
          drop: i.DS_DROP,
          img:
            this.img_url +
            i.CD_REFERENCIA.toString() +
            '/' +
            i.CD_REFERENCIA.toString() +
            '-1.jpg',
          status: i.Status,
          status_color: i.Status.toLowerCase().replace(' ', '-'),
          qnt: i.QT_OP,
        });
        this.descOP.map( (op) => {
          if (op.status == "Em andamento"){
            op.accent = 'success';
          } else if (op.status == "Pendente") {
            op.accent = 'warning';
          } else if (op.status == "Em atraso") {
            op.accent = 'danger';
          }else {
            op.accent = 'basic'
          }
        });
      });
      this.descOP$.next(this.descOP);
    });
  }

  filtroOP(event: Event): void {
    // this.descOP$.next(this.descOP);
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue == '') {
      this.filtroAtivo = false;
      this.descOP$.next(this.descOP);
    } else {
      this.filtroAtivo = true;
      this.descOP$.next(
        this.descOP.filter((_) => _.cod.includes(filterValue.toUpperCase()))
        );
      }
  }

  limpaFiltro(item: HTMLInputElement): void {
    this.filtroAtivo = false;
    item.value = '';
    this.descOP$.next(this.descOP);
  }

  openWindow(ref: string) {
    const buttonsConfig: NbWindowControlButtonsConfig = {
      minimize: false,
      maximize: false,
      fullScreen: false,
      close: true,
    };

    this.windowService.open(CarosselComponent, {
      context: { list: this.imgList.filter( (i) => i.includes(ref)) },
      title: `Imagens`,
      buttons: buttonsConfig,
    });
  }

  open(item: descOP) {
    this.NbDdialogService.open(DialogComponent, {
      context: {
        prevOP: item,
        prev: item.novaprevisao,
      },
    }).onClose.subscribe((x) => {
      if (!!x.prev) {
        item.novaprevisao = x.prev;
        item.checked = true;
        this.datas.push({ ref: item.ref.toString(), prev: item.novaprevisao });
      }
      if (x.removed) {
        item.novaprevisao = '';
        item.checked = false;
      }

      this.changeDetectorRef.detectChanges();
    });
  }
}

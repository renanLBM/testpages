import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { descOP } from 'src/app/models/descOP';
import { OPs } from 'src/app/models/ops';
import { DialogService } from 'src/app/services/dialog.service';
import { OpsService } from 'src/app/services/ops.service';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
})
export class DescricaoFaccaoComponent implements OnInit {
  filtroAtivo: boolean = false;

  listOPs!: OPs;
  descOP: descOP[] = [];
  descOP$: Subject<descOP[]> = new Subject();
  datas: any[] = [];

  binding = false;

  constructor(
    private _opsService: OpsService,
    private _route: ActivatedRoute,
    private NbDdialogService: NbDialogService,
    private dialogService: DialogService
  ) {}

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

      x.forEach((i) => {
        let prev = new Date(i.PREV_RETORNO)
          .toLocaleString('pt-br')
          .substring(0, 10);
        this.descOP.push({
          cod: i.NR_CICLO.toString() + '-' + i.NR_OP.toString(),
          ref: i.CD_REFERENCIA.toString(),
          previsao: prev,
          novaprevisao: '',
          checked: false,
          status: i.Status,
          qnt: i.QT_OP,
        });
        this.descOP$.next(this.descOP);
      });
    });
  }

  open(item: descOP) {
    this.NbDdialogService.open(DialogComponent, {
      context: {
        prev: item.novaprevisao
      },
    }).onClose.subscribe((x) => {
      item.checked = false;
      if (!!x.prev) {
        item.novaprevisao = x.prev;
        item.checked = true;
        this.datas.push({ ref: item.ref.toString(), prev: item.novaprevisao });
      }
      if (!!item.novaprevisao) {
        item.checked = true;
      }
      if(x.removed) {
        item.novaprevisao = '';
        item.checked = false;
      }
    });
  }

  filtroOP(event: Event): void {
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
}

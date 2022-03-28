import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OPs } from 'src/app/models/ops';
import { OpsService } from 'src/app/services/ops.service';

interface descOP {
  cod: string,
  ref: string,
  previsao: string
}

@Component({
  selector: 'fc-descricao-faccao',
  templateUrl: './descricao-faccao.component.html',
  styleUrls: ['./descricao-faccao.component.scss'],
})
export class DescricaoFaccaoComponent implements OnInit {

  listOPs!: OPs;
  descOP: descOP[] = [];

  constructor(
    private _opsService: OpsService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let id = this._route.snapshot.paramMap.get('id')!;
    this._opsService.getOp(id).subscribe(
      (x) => {
        x.forEach(
          (i) => {
            this.descOP.push({
              cod: i.NR_CICLO.toString() + '-' + i.NR_OP.toString(),
              ref: i.CD_REFERENCIA.toString(),
              previsao: i.PREV_RETORNO.toLocaleString()
            })
          }
        )
      }
    );

  }
}

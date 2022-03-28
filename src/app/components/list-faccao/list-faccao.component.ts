import { Component, OnInit } from '@angular/core';
import { OPs } from 'src/app/models/ops';
import { OpsService } from 'src/app/services/ops.service';
import { Subject } from 'rxjs';

interface faccao {
  id: number;
  name: string;
  qnt: number;
  color: string;
}

@Component({
  selector: 'fc-list-faccao',
  templateUrl: './list-faccao.component.html',
  styleUrls: ['./list-faccao.component.scss'],
})
export class ListFaccaoComponent implements OnInit {
  emptyList: boolean = false;

  color: string[] = ['warning', 'info', 'success', 'danger', 'primary'];

  listFaccoes: OPs = [];
  OpsList: any[] = [];
  OpList: faccao[] = [];
  OpList$: Subject<faccao[]> = new Subject();

  constructor(private _opsService: OpsService) {}

  ngOnInit(): void {
    this._opsService.getAllOPs().subscribe({
      next: (list) => {
        this.listFaccoes = list;

        this.listFaccoes.forEach((x) => {
          this.OpsList.push(x['DS_LOCAL']);
        });

        let uniq = [...new Set(this.OpsList)].filter((item) => item !== '');

        let qnt = this.OpsList.reduce((prev, cur) => {
          prev[cur] = (prev[cur] || 0) + 1;
          return prev;
        }, {});

        let id = 0;
        uniq.map((f: string, index: number) => {
          id = this.listFaccoes.find((x) => (x.DS_LOCAL == f))?.CD_LOCAL!;
          this.OpList.push(
            ...[
              {
                id: id,
                name: f,
                qnt: qnt[f],
                color: this.color[index % this.color.length],
              },
            ]
          );
        });

        this.OpList.sort((a, b) =>
          a.qnt < b.qnt ? 1 : b.qnt < a.qnt ? -1 : 0
        );

        this.OpList$.next(this.OpList);
      },
      error: (err: Error) => console.error(err),
    });
  }

  // TODO: Ajuste da verificação da lista vazia
  // lista não renderiza quando apagada a última letra que deu erro
  filtroFaccao(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue == '') {
      this.OpList$.next(this.OpList);
    } else {
      this.OpList$.next(
        this.OpList.filter((_) => _.name.includes(filterValue.toUpperCase()))
      );
      this.OpList$.subscribe((x) => (this.emptyList = !x.length));
    }
  }
}

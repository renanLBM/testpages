import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fc-pcp',
  templateUrl: './pcp.component.html',
  styleUrls: ['./pcp.component.scss']
})
export class PcpComponent implements OnInit {

  ops = [
    {
      text: 'Não enviada',
      qnt: 10,
      color: 'warning'
    },
    {
      text: 'Em andamento',
      qnt: 1,
      color: 'info'
    },
    {
      text: 'Liberada para coleta',
      qnt: 13,
      color: 'success'
    },
    {
      text: 'Pendência',
      qnt: 12,
      color: 'danger'
    }
  ];

  constructor() {
  }

  ngOnInit(): void {
    this.ops.sort((a, b) => (a.qnt < b.qnt) ? 1 : ((b.qnt < a.qnt) ? -1 : 0));
  }


}

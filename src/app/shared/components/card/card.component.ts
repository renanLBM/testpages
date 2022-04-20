import { Component, Input, OnInit } from '@angular/core';
import { NbComponentStatus } from '@nebular/theme';

@Component({
  selector: 'fc-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  constructor() {}
  @Input() loading: boolean = false;

  @Input() title: string = '';
  @Input() qnt_ops: number = 0;
  @Input() qnt_atraso: number = 0;
  @Input() show_desc: boolean = false;

  @Input() c_accent: NbComponentStatus = 'basic';
  @Input() c_status: string = 'basic';

  ngOnInit(): void {}
}

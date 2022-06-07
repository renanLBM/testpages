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
  @Input() per_atraso: number = 0;
  @Input() show_desc: boolean = false;
  @Input() page_desc: string = '';
  @Input() text_desc: string = '';
  qnt_text_desc: string = '';

  @Input() c_accent: NbComponentStatus = 'basic';
  @Input() c_status: string = 'basic';

  ngOnInit(): void {
    if( this.text_desc.includes('peças')){
      this.qnt_text_desc = this.qnt_atraso.toLocaleString('pt-Br');
    } else {
      this.qnt_text_desc = this.qnt_atraso + ' (' + this.per_atraso + '%)';
    }
    if(!this.show_desc) {
      this.page_desc = 'total-op-false';
    }else {
      this.page_desc = 'total-op';
    }
  }
}

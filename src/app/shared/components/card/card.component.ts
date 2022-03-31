import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'fc-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  constructor() { }
  @Input() loading: boolean = true;

  @Input() title: string = '';
  @Input() qnt_ops: number = 0;
  @Input() color: string = '';

  ngOnInit(): void {
  }

}

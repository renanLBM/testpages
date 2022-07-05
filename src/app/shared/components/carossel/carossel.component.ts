import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'fc-carossel',
  templateUrl: './carossel.component.html',
  styleUrls: ['./carossel.component.scss'],
})
export class CarosselComponent implements OnInit {
  err = false;
  @Input() list: [] = [];
  nImgs = 0;

  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: false },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    loop: false,
    preloadImages: true,
    spaceBetween: 30,
  };

  constructor() {}

  ngOnInit(): void {}
}

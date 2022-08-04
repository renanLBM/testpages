import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetTitleServiceService {

  title = new BehaviorSubject('FacControl');

  isMenuOpen = new BehaviorSubject<boolean>(false);

  setTitle(title: string) {
    this.title.next(title);
  }
}

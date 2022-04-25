import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetTitleServiceService {

  title = new BehaviorSubject('FacControl');

  setTitle(title: string) {
    this.title.next(title);
  }
}

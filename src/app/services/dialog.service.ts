import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  item = new BehaviorSubject(false);

  constructor() { }

  setMessage(item: string): void {
    if(!!item){
      this.item.next(true);
    }
  }

  getMessage() {
    return this.item.asObservable();
  }

  destroy() {
    this.item.next(false);
  }
}

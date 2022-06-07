import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OPs } from '../models/ops';

@Injectable({
  providedIn: 'root',
})
export class OpsFilteredService {

  setFilter(filtro: any): void {
    sessionStorage.setItem('filters', JSON.stringify(filtro));
  }

  getFilter(): any {
    const filters = sessionStorage.getItem('filters');
    return JSON.parse(filters!);
  }
}

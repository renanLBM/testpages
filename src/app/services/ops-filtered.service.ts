import { Injectable } from '@angular/core';

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

  setFilterRef(filtro: any): void {
    sessionStorage.setItem('filters_op', JSON.stringify(filtro));
  }

  getFilterRef(): any {
    const filters = sessionStorage.getItem('filters_op');
    return JSON.parse(filters!);
  }

  clearFilter(): void {
    sessionStorage.removeItem('filters');
    sessionStorage.removeItem('filters_op');
  }
}

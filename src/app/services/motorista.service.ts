import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Coleta, Coletas } from '../models/coleta';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class MotoristaService {
  constructor(private _httpClient: HttpClient) {}

  getColeta(): Observable<Coletas> {
    return this._httpClient.get<Coletas>(`${API}/api/getcoleta`);
  }

  setColeta(coleta: Coleta): Observable<number> {
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/setcoleta`, body).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }
        return 0;
      })
    );
  }

  removeColeta(coleta: Coleta): Observable<number> {
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/removecoleta`, body).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }
        return 0;
      })
    );
  }
}

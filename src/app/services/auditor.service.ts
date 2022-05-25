import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamento, Apontamentos } from '../models/apontamento';
import { Motivo, Motivos } from '../models/motivo';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class AuditorService {
  retorno: number = 0;
  constructor(private _httpClient: HttpClient) {}

  getMotivos(): Observable<Motivos> {
    return this._httpClient.get<Motivos>(`${API}/api/getmotivo`);
  }

  setMotivo(motivo: Motivo): Observable<number> {
    const body = JSON.stringify(motivo);
    return this._httpClient.post<any>(`${API}/api/setmotivo`, body).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }

        return 0;
      })
    );
  }

  removeMotivo(motivo: Motivo): Observable<number> {
    const body = JSON.stringify(motivo);
    return this._httpClient.post<any>(`${API}/api/removemotivo`, body).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }
        return 0;
      })
    );
  }

  getApontamento(): Observable<Apontamentos> {
    return this._httpClient.get<Apontamentos>(`${API}/api/getapontamento`);
  }

  setApontamento(apontamento: Apontamento): Observable<number> {
    const body = JSON.stringify(apontamento);
    return this._httpClient.post<any>(`${API}/api/setapontamento`, body).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }
        return 0;
      })
    );
  }
}

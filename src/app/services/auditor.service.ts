import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamento, Apontamentos } from '../models/apontamento';
import { Motivo, Motivos } from '../models/motivo';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class AuditorService {
  constructor(
    private _httpClient: HttpClient,
    private _tokenService: TokenService
  ) {}

  getMotivos(): Observable<Motivos> {
    const headers = this.getToken();
    return this._httpClient.get<Motivos>(`${API}/api/getmotivo`, { headers });
  }

  setMotivo(motivo: Motivo): Observable<number> {
    const body = JSON.stringify(motivo);
    const headers = this.getToken();
    return this._httpClient
      .post<any>(`${API}/api/setmotivo`, body, { headers })
      .pipe(
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
    const headers = this.getToken();
    return this._httpClient
      .post<any>(`${API}/api/removemotivo`, body, { headers })
      .pipe(
        map((res) => {
          if (res == 'ok') {
            return 1;
          }
          return 0;
        })
      );
  }

  getApontamento(): Observable<Apontamentos> {
    const headers = this.getToken();
    return this._httpClient.get<Apontamentos>(`${API}/api/getapontamento`, {
      headers,
    });
  }

  setApontamento(apontamento: Apontamento): Observable<number> {
    const body = JSON.stringify(apontamento);
    const headers = this.getToken();
    return this._httpClient
      .post<any>(`${API}/api/setapontamento`, body, { headers })
      .pipe(
        map((res) => {
          if (res == 'ok') {
            return 1;
          }
          return 0;
        })
      );
  }

  getToken() {
    const token = this._tokenService.getToken();
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }
}

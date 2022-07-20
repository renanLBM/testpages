import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamentos } from '../models/apontamento';
import { Coleta, Coletas } from '../models/coleta';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class MotoristaService {
  constructor(private _httpClient: HttpClient, private _tokenService: TokenService) {}

  listDisponivel(): Observable<Apontamentos> {
    const headers = this.getToken();
    return this._httpClient.get<Apontamentos>(`${API}/api/motorista`, {
      headers,
    });
  }

  setColeta(coleta: Coleta): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/setcoleta`, body, {
      headers,
    }).pipe(
      map((res) => {
        if (res == 'ok') {
          return 1;
        }
        return 0;
      })
    );
  }

  removeColeta(coleta: Coleta): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/removecoleta`, body, {
      headers,
    }).pipe(
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

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Coleta } from '../models/coleta';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class MotoristaService {
  constructor(private _httpClient: HttpClient, private _tokenService: TokenService) {}

  listDisponivel(): Observable<any> {
    const headers = this.getToken();
    return this._httpClient.get<any>(`${API}/api/faccaocontrol/coleta/all`, {
      headers,
    });
  }

  setColeta(coleta: Coleta): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/faccaocontrol/coleta/add`, body, {
      headers,
    }).pipe(
      map((res) => {
        if (res.data == 'OK') {
          return 1;
        }
        return 0;
      })
    );
  }

  removeColeta(coleta: Coleta): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(coleta);
    return this._httpClient.post<any>(`${API}/api/faccaocontrol/coleta/remove`, body, {
      headers,
    }).pipe(
      map((res) => {
        if (res.data == 'OK') {
          return 1;
        }
        return 0;
      })
    );
  }

  private getToken() {
    const token = this._tokenService.getToken();
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }
}

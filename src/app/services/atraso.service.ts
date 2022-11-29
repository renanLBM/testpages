import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamento } from '../models/apontamento';
import { Motivo } from '../models/motivo';
import { TokenService } from './token.service';
import { UserService } from './user.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class AtrasoService {
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _tokenService: TokenService
  ) {}

  getMotivos(id?: string): Observable<any> {
    const headers = this.getToken();
    if (!id) {
      return this._httpClient
        .get<any>(`${API}/api/atraso/all`, {
          headers,
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status == 401) this.missingToken();
            return EMPTY;
          })
        );
    } else {
      return this._httpClient
        .get<any>(`${API}/api/atraso/local/${id}`, {
          headers,
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status == 401) this.missingToken();
            return EMPTY;
          })
        );
    }
  }

  setMotivo(motivo: Motivo): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(motivo);
    return this._httpClient
      .post<any>(`${API}/api/add/atraso`, body, { headers })
      .pipe(
        map((res) => {
          let x = res['data'];
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
      .post<any>(`${API}/api/remove/atraso`, body, { headers })
      .pipe(
        map((res) => {
          if (res == 'ok') {
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

  private missingToken() {
    alert('Sessão expirada!');
    this._userService.logout();
  }
}

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamento, Apontamentos } from '../models/apontamento';
import { Motivo, Motivos } from '../models/motivo';
import { TokenService } from './token.service';
import { UserService } from './user.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class AuditorService {
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _tokenService: TokenService
  ) {}

  getMotivos(id?: string): Observable<Motivos> {
    const headers = this.getToken();
    if (!id) {
      return this._httpClient
        .get<Motivos>(`${API}/api/getmotivo`, {
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
        .get<Motivos>(`${API}/api/getmotivo/${id}`, {
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

  getApontamento(id?: string): Observable<Apontamentos> {
    const headers = this.getToken();
    if (!id) {
      return this._httpClient
        .get<Apontamentos>(`${API}/api/getapontamento`, {
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
        .get<Apontamentos>(`${API}/api/getapontamento/${id}`, {
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

  missingToken() {
    alert('Sessão expirada!');
    this._userService.logout();
  }
}

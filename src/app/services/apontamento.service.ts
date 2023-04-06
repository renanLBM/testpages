import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Apontamento } from '../models/apontamento';
import { TokenService } from './token.service';
import { UserService } from './user.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class ApontamentoService {
  constructor(
    private _httpClient: HttpClient,
    private _tokenService: TokenService,
    private _userService: UserService
  ) {}

  getApontamentosResumido(): Observable<any> {
    const headers = this.getToken();

    return this._httpClient
      .get<any>(`${API}/api/faccaocontrol/apontamento/resumido/origem_colecao`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
  }

  getApontamento(id?: string): Observable<any> {
    const headers = this.getToken();
    if (!id) {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/apontamento/all`, {
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
        .get<any>(`${API}/api/faccaocontrol/apontamento/local/${id}`, {
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

  logApontamento(cd_local?: string, nr_reduzido?: string): Observable<any> {
    const headers = this.getToken();
    if(!!cd_local && !!nr_reduzido) {
      return this._httpClient
        .get<any>(
          `${API}/api/faccaocontrol/apontamento/log/${cd_local}/${nr_reduzido}`,
          {
            headers,
          }
        )
        .pipe(
          map((res) => {
            const resultado = JSON.parse(res['data']);
            return resultado.length > 0 ? resultado : null;
          }),
          catchError((error: HttpErrorResponse) => {
            if (error.status == 401) this.missingToken();
            return EMPTY;
          })
        );
    }
    return this._httpClient
      .get<any>(
        `${API}/api/faccaocontrol/apontamento/log`,
        {
          headers,
        }
      )
      .pipe(
        map((res) => {
          const resultado = JSON.parse(res['data']);
          return resultado.length > 0 ? resultado : null;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
  }

  setApontamento(apontamento: Apontamento): Observable<number> {
    const body = JSON.stringify(apontamento);
    const headers = this.getToken();
    return this._httpClient
      .post<any>(`${API}/api/faccaocontrol/apontamento/add`, body, { headers })
      .pipe(
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
    if (!token) {
      let headerDict = new HttpHeaders();
      return headerDict;
    }
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }

  private missingToken() {
    alert('Sessão expirada!');
    this._userService.logout();
  }
}

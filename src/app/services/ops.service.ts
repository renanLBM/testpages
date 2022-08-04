import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable } from 'rxjs';
import { OPs } from '../models/ops';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class OpsService {
  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _tokenService: TokenService
  ) {}

  getAllOPs(): Observable<OPs> {
    const headers = this.getToken();
    let loggedUser = this._userService.getSession();
    let regiao = loggedUser.regiao;
    if (regiao && loggedUser.nivel != 0) {
      return this._httpClient
        .get<OPs>(`${API}/api/getfaccao/${regiao}`, {
          headers,
        })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status == 401) this.missingToken();
            return EMPTY;
          })
        );
    }
    return this._httpClient
      .get<OPs>(`${API}/api/getfaccao`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
  }

  getOpById(local: string, cod?:string): Observable<OPs> {
    const headers = this.getToken();
    if (!!cod) {
      return this._httpClient
      .get<OPs>(`${API}/api/getop/${local}/${cod}`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
    }else{
      return this._httpClient
        .get<OPs>(`${API}/api/getop/${local}/`, {
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

  getOpByStatus(status: string, origem?: string): Observable<OPs> {
    const headers = this.getToken();
    if (!origem) {
      return this._httpClient
        .get<OPs>(`${API}/api/getopbystatus/${status}`, {
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
        .get<OPs>(`${API}/api/getopbyorigem/${status}/${origem}`, {
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

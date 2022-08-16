import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OPs } from '../models/ops';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { TokenService } from './token.service';
import { CryptoService } from './crypto.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class OpsService {
  opsData!: OPs;
  opsData$: BehaviorSubject<OPs> = new BehaviorSubject<OPs>(this.opsData);

  constructor(
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _tokenService: TokenService,
    private _cryptoService: CryptoService
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
          tap((res) => {
            this.opsData$.next(res);
            this.setSessionData();
          }),
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
        tap((res) => {
          this.opsData$.next(res);
          this.setSessionData();
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
  }

  getOpById(local: string, cod?: string): Observable<OPs> {
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
    } else {
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

  getOPsData(): Observable<OPs> {
    return this.opsData$.asObservable();
  }

  setSessionData(): void {
    this.getOPsData().subscribe((ops) => {
      const msg = this._cryptoService.msgCrypto(JSON.stringify(ops));
      sessionStorage.setItem('data', msg);
    });
  }

  getSessionData(): OPs {
    const dataSaved = sessionStorage.getItem('data');
    const msg = !dataSaved ? null : this._cryptoService.msgDecrypto(dataSaved!);
    if(!msg) {
      return [];
    }
    return JSON.parse(msg);
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

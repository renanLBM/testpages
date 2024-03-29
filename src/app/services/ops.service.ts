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
import { LocalFaccoes } from '../models/localFacao';

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

  getAllOPs(): Observable<any> {
    const headers = this.getToken();
    return this._httpClient
      .get<any>(`${API}/api/faccaocontrol/op/all`, {
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

  getOPsRegiao(): Observable<any> {
    const headers = this.getToken();
    const loggedUser = this._userService.getSession();
    let regiao = loggedUser.regiao;
    if (regiao == '99999') {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/op/all`, {
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
    } else {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/op/regiao/${regiao}`, {
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
  }

  getAllOPsResumido(): Observable<any> {
    const headers = this.getToken();

    return this._httpClient
      .get<OPs>(`${API}/api/faccaocontrol/op/resumido/all`, {
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

  getOpById(cod: string, local?: string): Observable<any> {
    const headers = this.getToken();
    if (!!local) {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/op/id/${cod + '-' + local}`, {
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
        .get<any>(`${API}/api/faccaocontrol/op/id/${cod}`, {
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
  getOpByLocal(local: string): Observable<any> {
    const headers = this.getToken();
    return this._httpClient
      .get<any>(`${API}/api/faccaocontrol/op/local/${local}`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
        })
      );
  }

  getOpByStatus(status: string, origem?: string): Observable<any> {
    const headers = this.getToken();
    if (!origem) {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/op/status/${status}`, {
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
        .get<any>(`${API}/api/faccaocontrol/op/status/${status}/${origem}`, {
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

  getLocalFaccao(local?: string) {
    const headers = this.getToken();
    if (!!local) {
      return this._httpClient
        .get<any>(`${API}/api/faccaocontrol/local/${local}`, {
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
        .get<any>(`${API}/api/faccaocontrol/local/all`, {
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
      sessionStorage.setItem('data-time', Date.now().toString());
    });
  }

  getSessionData(): OPs {
    const dataSaved = sessionStorage.getItem('data');
    const msg = !dataSaved ? null : this._cryptoService.msgDecrypto(dataSaved!);
    if (!msg || !this.isDataSessionOk()) {
      sessionStorage.removeItem('data');
      sessionStorage.removeItem('data-time');
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

  isDataSessionOk(): boolean {
    const dateTime = parseInt(sessionStorage.getItem('data-time') || '0');
    let dateNowDif = Date.now() - dateTime;

    // se a última atualização for maior que 30min retorna falso
    if (dateNowDif > 900000) return false;

    // se a última atualização foi a menos de 1,5 minutos retorna "OK"
    if (dateNowDif > 90000) {
      const hourCache = new Date(dateTime).getHours();
      const minutesCache = new Date(dateTime).getMinutes();
      const hourNow = new Date().getHours();

      // se a hora do cache for menor que a hora atual
      // ou se está no limite da atualização do banco (até o sexto minuto da hora. Ex.: 10:06h)
      if (hourCache < hourNow || minutesCache <= 6) {
        return false;
      }
    }
    return true;
  }
}

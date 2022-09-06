import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import jwt_decode from 'jwt-decode';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { CryptoService } from './crypto.service';
import { TokenService } from './token.service';

const API = environment.API_ENV;

interface RetornoAPI {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usuarioSubject = new BehaviorSubject<User>({
    nivel: 0,
    nome: '',
  });
  private nivel = 0;
  private logged = new BehaviorSubject<boolean>(false);
  autenticando = new BehaviorSubject<boolean>(false);

  constructor(
    private _auth: AngularFireAuth,
    private _httpClient: HttpClient,
    private _router: Router,
    private _tokenService: TokenService,
    private _cryptoService: CryptoService,
    private _toasterService: NbToastrService
  ) {
    if (this._tokenService.hasToken()) {
      this.decodeJWT();
    }
  }

  private decodeJWT() {
    const token = this._tokenService.getToken();
    const userJWT: { user: User; ext: number } = jwt_decode(token);

    this.usuarioSubject.next(userJWT.user);
    this.setUser(userJWT.user);
  }

  setToken(token: string) {
    this._tokenService.setToken(token);
    this.decodeJWT();
  }

  login(login: string, senha: string): Observable<HttpResponse<any>> {
    return this._httpClient
      .post(
        `${API}/api/login`,
        { login: login, senha: senha },
        { observe: 'response', responseType: 'text' }
      )
      .pipe(
        tap((res) => {
          const resBody: RetornoAPI = JSON.parse(res.body!);
          const authToken = resBody.token;
          this.setToken(authToken);
          this.logged.next(true);
        })
      );
  }

  getUserFromDB(user: User): Observable<HttpResponse<any>> {
    if (!user) throw 'E-mail not found!';
    const logginUser = JSON.stringify(user);

    this.autenticando.next(true);

    return this._httpClient
    .post(`${API}/api/user`, { user: logginUser }, { observe: 'response' })
    .pipe(
      tap((res) => {
        const resBody: RetornoAPI = res.body as RetornoAPI;
        const authToken = resBody.token;
        this.setToken(authToken);
        this.logged.next(true);
        this.autenticando.next(false);
      }),
      catchError((err) => {
        console.log(err);
        this.autenticando.next(false);
        this._toasterService.danger('Erro ao acessar o servidor!', 'Erro',{
          preventDuplicates: true,
        });
          return of(err.error);
        })
      );
  }

  getUser(): Observable<User> {
    return this.usuarioSubject.asObservable();
  }

  setUser(user: User): void {
    if (user) {
      this.usuarioSubject.next(user);
      this.nivel = user.nivel!;
      this.setSession();
    }
  }

  setSession(): void {
    this.getUser().subscribe((user) => {
      const msg = this._cryptoService.msgCrypto(JSON.stringify(user));
      sessionStorage.setItem('user', JSON.stringify(msg));
    });
  }

  getSession(): User {
    const loggedUser = sessionStorage.getItem('user') || '';

    const msg = this._cryptoService.msgDecrypto(loggedUser!);
    if (!!msg) {
      return JSON.parse(msg);
    }
    return {
      nivel: 0,
      nome: '',
    };
  }

  isLogged(): boolean {
    return !!this.getSession().nome;
  }

  getLogged(): Observable<boolean> {
    return this.logged.asObservable();
  }

  getNivel(): number {
    try {
      let userS: User = this.getSession();
      this.nivel = userS.nivel!;
    } catch (err) {
      this.nivel = 0;
    }

    return this.nivel;
  }

  googleSignOut() {
    this._auth.signOut().then(() => {
      this._router.navigate(['login']);
    });
  }

  logout(): void {
    this.usuarioSubject.next({
      nivel: 0,
      nome: '',
    });
    this.logged.next(false);
    sessionStorage.clear();
    localStorage.clear();
    this.googleSignOut();
    this._router.navigate(['login']);
  }
}

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { TokenService } from './token.service';
import jwt_decode from 'jwt-decode';

const API = environment.API_ENV;
const KEY = environment.ENCRIPT_KEY;

const header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Access-Token': 'application/json',
};

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

  constructor(
    private _httpClient: HttpClient,
    private _tokenService: TokenService
  ) {
    if (this._tokenService.hasToken()) {
      this.decodeJWT();
    }
  }

  private decodeJWT() {
    const token = this._tokenService.getToken();
    const userJWT: {user: User, ext: number} = jwt_decode(token);

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
          const resBody: {'message': string, 'token': string} = JSON.parse(res.body!);
          const authToken = resBody.token;
          this.setToken(authToken);
          this.logged.next(true);
        })
      );
  }

  getUser(): Observable<User> {
    return this.usuarioSubject.asObservable();
  }

  setUser(user: User): void {
    if (user) {
      this.nivel = user.nivel;
      this.setSession();
    }
  }

  setSession(): void {
    this.getUser().subscribe((user) => {
      sessionStorage.setItem('user', JSON.stringify(user));
    });
  }

  getSession(): User {
    const loggedUser = sessionStorage.getItem('user');
    return JSON.parse(loggedUser!);
  }

  isLogged(): boolean {
    return !!this.getSession();
  }

  getLogged(): Observable<boolean> {
    return this.logged.asObservable();
  }

  getNivel(): number {
    try {
      let userS: User = this.getSession();
      this.nivel = userS.nivel;
    } catch (err) {
      this.nivel = 0;
    }

    return this.nivel;
  }

  logout(): void {
    this.usuarioSubject.next({
      nivel: 0,
      nome: '',
    });
    this.logged.next(false);
    this._tokenService.deleteToken();
    sessionStorage.clear();
  }
}

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import * as CryptoJS from 'crypto-js';

const API = environment.API_ENV;
const KEY = environment.ENCRIPT_KEY;
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

  constructor(private _httpClient: HttpClient) {}

  login(login: string, senha: string): Observable<HttpResponse<any>> {
    return this._httpClient
      .post(
        `${API}/api/login`,
        { login: login, senha: senha },
        { observe: 'response' }
      )
      .pipe(
        tap((res: any) => {
          this.setUser(res.body);
          this.logged.next(true);
        })
      );
  }

  getUser(): Observable<User> {
    return this.usuarioSubject.asObservable();
  }

  setUser(userB: string): void {
    if (userB) {
      let userF: User = JSON.parse(userB);
      this.usuarioSubject.next(userF);
      this.nivel = userF.nivel;
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
    sessionStorage.clear();
  }
}

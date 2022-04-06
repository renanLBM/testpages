import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usuarioSubject = new BehaviorSubject<User>({
    nivel: 0,
    nome: '',
  });
  private admin = new BehaviorSubject<boolean>(false);
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
        tap((res) => {
          this.setUser(res.body);
          this.logged.next(true);
        })
      );
  }

  getUser() {
    return this.usuarioSubject.asObservable();
  }

  setUser(op: any) {
    this.usuarioSubject.next(op);
    this.setSession();
  }

  setSession() {
    this.getUser().subscribe((user) => {
      sessionStorage.setItem('user', JSON.stringify(user));
    });
  }

  getSession() {
    const loggedUser = sessionStorage.getItem('user');
    return JSON.parse(loggedUser!);
  }

  isLogged() {
    return !!this.getSession();
  }

  getLogged() {
    return this.logged.asObservable();
  }

  logout() {
    this.usuarioSubject.next({
      nivel: 0,
      nome: ''
    });
    this.logged.next(false);
    sessionStorage.clear();
  }
}

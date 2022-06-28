import { Injectable } from '@angular/core';

const KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  getToken() {
    return localStorage.getItem(KEY) ?? '';
  }

  setToken(token: string) {
    localStorage.setItem(KEY, token);
  }

  deleteToken() {
    localStorage.removeItem(KEY);
  }

  hasToken(): boolean{
    const validToken = !!this.getToken() && this.getToken() != 'undefined';
    return validToken;
  }
}

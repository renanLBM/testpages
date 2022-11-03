import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
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
      .get<any>(`${API}/api/apontamento/resumido/origem_colecao`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status == 401) this.missingToken();
          return EMPTY;
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

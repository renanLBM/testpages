import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    private _user: UserService,
    private _tokenService: TokenService
  ) {}

  getAllOPs(): Observable<OPs> {
    const headers = this.getToken();
    let loggedUser = this._user.getSession();
    let regiao = loggedUser.regiao;
    if (regiao && loggedUser.nivel != 0) {
      return this._httpClient.get<OPs>(`${API}/api/getfaccao/${regiao}`, {
        headers,
      });
    }
    return this._httpClient.get<OPs>(`${API}/api/getfaccao`, {
      headers,
    });
  }

  getOpById(id: string): Observable<OPs> {
    const headers = this.getToken();
    return this._httpClient.get<OPs>(`${API}/api/getop/${id}`, {
      headers,
    });
  }

  getOpByStatus(status: string, origem?: string): Observable<OPs> {
    const headers = this.getToken();
    if (!origem) {
      return this._httpClient.get<OPs>(`${API}/api/getopbystatus/${status}`, {
        headers,
      });
    } else {
      return this._httpClient.get<OPs>(
        `${API}/api/getopbyorigem/${status}/${origem}`,
        {
          headers,
        }
      );
    }
  }

  getToken() {
    const token = this._tokenService.getToken();
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }
}

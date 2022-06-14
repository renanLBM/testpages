import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OPs } from '../models/ops';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class OpsService {
  constructor(private _user: UserService, private _httpClient: HttpClient) {}

  getAllOPs(): Observable<OPs> {
    let loggedUser = this._user.getSession();
    let regiao = loggedUser.regiao;
    if(regiao && loggedUser.nivel != 99){
      return this._httpClient.get<OPs>(`${API}/api/getfaccao/${regiao}`);
    }
    return this._httpClient.get<OPs>(`${API}/api/getfaccao`);
  }

  getOpById(id: string): Observable<OPs> {
    return this._httpClient.get<OPs>(`${API}/api/getop/${id}`);
  }

  getOpByStatus(status: string, origem?: string): Observable<OPs> {
    if (!origem) {
      return this._httpClient.get<OPs>(`${API}/api/getopbystatus/${status}`);
    } else {
      return this._httpClient.get<OPs>(
        `${API}/api/getopbyorigem/${status}/${origem}`
      );
    }
  }
}

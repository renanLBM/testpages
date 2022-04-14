import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OPs } from '../models/ops';
import { environment } from 'src/environments/environment';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class OpsService {

  constructor(private _httpClient: HttpClient) { }

  getAllOPs(): Observable<OPs> {
    // return this._httpClient.get<OPs>(`${API}/listops`);
    return this._httpClient.get<OPs>(`${API}/api/getfaccao`);
  }

  getOpById(id: string): Observable<OPs> {
    return this._httpClient.get<OPs>(`${API}/api/getop/${id}`);
  }

  getOpByStatus(status: string): Observable<OPs> {
    return this._httpClient.get<OPs>(`${API}/api/getopbystatus/${status}`);
  }
}

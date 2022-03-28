import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OPs } from '../models/ops';
import { environment } from 'src/environments/environment';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class OpsService {
  private opsSelecionadas = new BehaviorSubject<OPs>([]);

  constructor(private _httpClient: HttpClient) { }

  getAllOPs(): Observable<OPs> {
    return this._httpClient.get<OPs>(`${API}/listops`);
  }

  getOp(id: string): Observable<OPs> {
    return this._httpClient.get<OPs>(`${API}/getop/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Motivo, Motivos } from '../models/motivo';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root'
})
export class AuditorService {

  constructor(private _httpClient: HttpClient) { }

  getMotivos(): Observable<Motivos> {
    return this._httpClient.get<Motivos>(`${API}/api/getmotivo`);
  }

  setMotivo(motivo: Motivo): void {
    const body = JSON.stringify(motivo);
    this._httpClient.post<any>(`${API}/api/setmotivo`, body).subscribe( (data) =>
      console.log('ok')
    );
  }

  removeMotivo(motivo: Motivo): void {
    const body = JSON.stringify(motivo);
    this._httpClient.post<any>(`${API}/api/removemotivo`, body).subscribe( (data) =>
      console.log('ok')
    );
  }

}


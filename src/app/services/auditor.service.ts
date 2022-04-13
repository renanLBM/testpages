import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root'
})
export class AuditorService {

  constructor(private _httpClient: HttpClient) { }

  // getCliente(id: string): Observable<Cliente> {
  //   return this._httpClient.get<Cliente>(`${API}/api/cliente/${id}`);
  // }

  setCliente(cliente: any): Observable<any> {
    const body = JSON.stringify(cliente)
    return this._httpClient.post<any>(`${API}/api/setcliente`, body);
  }

}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Pendencia, Pendencias } from '../models/pendencia';
import { DataTableConstants } from '../shared/datatable-constants.service';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class PendenciasService {
  constructor(
    private _httpClient: HttpClient,
    private _tokenService: TokenService,
    private _datatableConstants: DataTableConstants
  ) {}

  listMateriaPrima(cod_op: string): Observable<any> {
    const headers = this.getToken();
    return this._httpClient.get<any>(
      `${API}/api/faccaocontrol/materiaprima/${cod_op}`,
      {
        headers,
      }
    );
  }

  listPendencia(user?: number, ativo?: number): Observable<any> {
    const headers = this.getToken();

    if (!!user) {
      return this._httpClient.get<any>(
        `${API}/api/faccaocontrol/pendencia/${user}/${ativo}`,
        {
          headers,
        }
      );
    }
    return this._httpClient.get<any>(`${API}/api/faccaocontrol/pendencia/all`, {
      headers,
    });
  }

  setPendencia(pendencias: Pendencias): Observable<string[]> {
    const headers = this.getToken();

    const body = JSON.stringify(pendencias);
    return this._httpClient
      .post<any>(`${API}/api/faccaocontrol/pendencia/add`, body, {
        headers,
      })
      .pipe(
        map((res) => {
          let x = res['data'];
          if (x == 'OK') {
            return x;
          }
          return x;
        })
      );
  }

  editPendencia(pendencia: Pendencia): Observable<number> {
    const headers = this.getToken();

    const body = JSON.stringify(pendencia);
    return this._httpClient
      .post<any>(`${API}/api/faccaocontrol/pendencia/edit`, body, {
        headers,
      })
      .pipe(
        map((res) => {
          let x = res['data'];
          if (x == 'OK') {
            return 1;
          }
          return 0;
        })
      );
  }

  getUsuariosPendencias(): Observable<string[]> {
    const headers = this.getToken();
    return this._httpClient
      .get<any>(`${API}/api/faccaocontrol/apontamento/usuario-pendencia`, {
        headers,
      })
      .pipe(
        map((res) => {
          this._datatableConstants.setUsuariosPendencias(res['data']);
          return res['data'];
        })
      );
  }

  private getToken() {
    const token = this._tokenService.getToken();
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MateriasPrimas } from '../models/materiaPrima';
import { Pendencia, Pendencias } from '../models/pendencia';
import { TokenService } from './token.service';

const API = environment.API_ENV;

@Injectable({
  providedIn: 'root',
})
export class PendenciasService {
  constructor(
    private _httpClient: HttpClient,
    private _tokenService: TokenService
  ) {}

  listMateriaPrima(cod_op: string): Observable<MateriasPrimas> {
    const headers = this.getToken();
    return this._httpClient.get<MateriasPrimas>(
      `${API}/api/materiaprima/${cod_op}`,
      {
        headers,
      }
    );
  }

  listPendencia(user?: string): Observable<Pendencias> {
    const headers = this.getToken();

    if (!!user) {
      return this._httpClient.get<Pendencias>(
        `${API}/api/getpendencia/${user}`,
        {
          headers,
        }
      );
    }
    return this._httpClient.get<Pendencias>(`${API}/api/getpendencia`, {
      headers,
    });
  }

  setPendencia(pendencias: Pendencias): Observable<number> {
    const headers = this.getToken();
    const body = JSON.stringify(pendencias);
    return this._httpClient
      .post<any>(`${API}/api/setpendencia`, body, {
        headers,
      })
      .pipe(
        map((res) => {
          if (res == 'ok') {
            return 1;
          }
          return 0;
        })
      );
  }

  alterarStatus(pendencia: Pendencia, novoStatus?: string) {
    const headers = this.getToken();
    pendencia['novoStatus'] = !!novoStatus ? novoStatus : '';
    const body = JSON.stringify(pendencia);
    return this._httpClient
      .post<any>(`${API}/api/editpendencia`, body, {
        headers,
      })
      .pipe(
        map((res) => {
          if (res == 'ok') {
            return 1;
          }
          return 0;
        })
      );
  }

  confirmarRecebimento(pendencia: Pendencia) {
    const headers = this.getToken();
    const body = JSON.stringify(pendencia);
    return this._httpClient
      .post<any>(`${API}/api/setconfirmapendencia`, body, {
        headers,
      })
      .pipe(
        map((res) => {
          if (res == 'ok') {
            return 1;
          }
          return 0;
        })
      );
  }

  private getToken() {
    const token = this._tokenService.getToken();
    let headerDict = new HttpHeaders().append('x-access-token', token);
    return headerDict;
  }
}

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PendenciaLocal } from 'src/app/models/localFacao';
import { Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-hist-pendencias',
  templateUrl: './hist-pendencias.component.html',
  styleUrls: ['./hist-pendencias.component.scss'],
})
export class HistPendenciasComponent implements OnInit {
  // TODO:
  // make this an enum to change in Auditor and PCP
  ignoredStatus = ['Em análise', 'Almoxarifado', 'Enviado'];

  statusPendencia: string[] = [];
  selectedStatusPendencia: string = '';

  localEnum: string[] = [];
  selectedLocal: string[] = [];
  idSelectedLocal: number[] = [];

  loading = new BehaviorSubject<boolean>(true);
  loadingError = false;
  isEmptyList = false;

  minhasPendencias: Pendencias = [];
  minhasPendenciasLocal: PendenciaLocal[] = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);
  minhasPendenciasLocal$: BehaviorSubject<PendenciaLocal[]> =
    new BehaviorSubject<PendenciaLocal[]>([]);

  constructor(
    private _location: Location,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    let usuario = 0;
    this._userService.getUser().subscribe((_) => (usuario = _.CD_USUARIO!));
    this._pendenciaService.listPendencia(usuario, 0).subscribe({
      next: (pendencias) => {
        this.minhasPendencias = JSON.parse(pendencias.data);
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) =>
            !this.ignoredStatus.includes(pendencia.DS_STATUS_PENDENCIA)
        );

        this.minhasPendencias.forEach((pendencia) => {
          let dataAjustada = new Date(pendencia.DT_SOLICITACAO);
          pendencia.DT_SOLICITACAO = new Date(dataAjustada).toLocaleString(
            'pt-Br',
            { timeZone: 'UTC' }
          );
          pendencia.cod =
            pendencia.NR_CICLO +
            '-' +
            pendencia.NR_OP +
            '-' +
            pendencia.CD_REFERENCIA;

          if (this.minhasPendenciasLocal.length > 0) {
            if (
              this.minhasPendenciasLocal.filter(
                (l) =>
                  l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL
              ).length
            ) {
              this.minhasPendenciasLocal
                .filter(
                  (l) =>
                    l.local == pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL
                )[0]
                .pendencias.push(pendencia);
            } else {
              this.minhasPendenciasLocal.push({
                local: pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL,
                pendencias: [pendencia],
              });
            }
          } else {
            this.minhasPendenciasLocal.push({
              local: pendencia.CD_LOCAL + ' - ' + pendencia.DS_LOCAL,
              pendencias: [pendencia],
            });
          }
        });

        // set the solicitante dropdown
        let tmpLocal = this.minhasPendenciasLocal.flatMap((x) => x.local);
        this.localEnum = Array.from(new Set(tmpLocal));

        this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);

        this._setTituloService.setTitle('Histórico de Pendências');
        this.loading.next(false);
      },
      error: (err) => {
        this.isEmptyList = true;
        this.loading.next(false);
      },
    });
  }

  filtroOP(event: Event): void {
    this.idSelectedLocal = [];
    document.getElementById('filtro-op')?.focus();
    const filterValue = (event.target as HTMLInputElement).value;

    this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
    let filteredArray = this.minhasPendenciasLocal;
    // se filtro status
    // verificar se o filtro solicitante está ativo e filtrar os dois
    // caso contrário filtrar somente status
    if (filterValue.length > 0) {
      filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) => p.cod?.includes(filterValue)),
        };
        return filtered;
      });

      filteredArray = filteredArray.filter((_) => _.pendencias.length > 0);

      this.orderByQntPendencia(filteredArray);
      this.minhasPendenciasLocal$.next(filteredArray);
    }
  }

  filtroDropdown() {
    (document.getElementById('filtro-op') as HTMLInputElement)!.value = '';
    this.selectedLocal = [];
    this.idSelectedLocal.forEach((x) => {
      this.selectedLocal.push(this.localEnum[x]);
    });

    this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
    // se filtro status
    // verificar se o filtro solicitante está ativo e filtrar os dois
    // caso contrário filtrar somente status
    if (this.selectedLocal.length > 0) {
      let filteredArray = this.minhasPendenciasLocal.filter((_) => {
        return this.selectedLocal.includes(_.local);
      });
      filteredArray = filteredArray.filter((_) => _.pendencias.length > 0);
      this.orderByQntPendencia(filteredArray);
      this.minhasPendenciasLocal$.next(filteredArray);
    }
  }

  orderByQntPendencia(arrayToSort: PendenciaLocal[]) {
    arrayToSort.sort((a, b) => {
      return a.pendencias.length < b.pendencias.length
        ? 1
        : b.pendencias.length < a.pendencias.length
        ? -1
        : 0;
    });
  }

  voltar() {
    this._location.back();
  }
}

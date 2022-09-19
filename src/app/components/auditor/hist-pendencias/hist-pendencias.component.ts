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
    private _pendenciaService: PendenciasService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    let usuario = '';
    this._userService.getUser().subscribe((_) => (usuario = _.nome!));
    this._pendenciaService.listPendencia(usuario).subscribe({
      next: (pendencias) => {
        this.minhasPendencias = pendencias;
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) => !this.ignoredStatus.includes(pendencia.STATUS)
        );

        let flatCdLocal = this.minhasPendencias.flatMap((_) => _.CD_LOCAL + '');

        this._opsService.getLocalFaccao().subscribe({
          next: (local) => {
            // passar por todos os locais e adicionar na variavel minhasPendenciasLocal os que forem encontrados no flatCdLocal
            local.forEach((lcod) => {
              if (flatCdLocal.includes(lcod.CD_LOCAL)) {
                let tmpPendencia: Pendencias = [];
                // passar por todas as pendencias e incluir em cada local
                this.minhasPendencias.forEach((pendencia) => {
                  pendencia.cod =
                    pendencia.NR_CICLO +
                    '-' +
                    pendencia.NR_OP +
                    '-' +
                    pendencia.CD_REFERENCIA;
                  if (lcod.CD_LOCAL == pendencia.CD_LOCAL + '') {
                    tmpPendencia.push(pendencia);
                  }
                });
                this.minhasPendenciasLocal.push({
                  local: lcod.CD_LOCAL + ' - ' + lcod.DS_LOCAL,
                  pendencias: tmpPendencia,
                });

                let tmpLocal = this.minhasPendenciasLocal.flatMap(
                  (x) => x.local
                );
                // set the solicitante dropdown
                this.localEnum = Array.from(new Set(tmpLocal));
              }
            });

            this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          },
          error: (err) => {
            console.warn(err);
          },
        });

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

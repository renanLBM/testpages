import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { StatusPendencia } from 'src/app/models/enums/enumStatusPendencia';
import { PendenciaLocal } from 'src/app/models/localFacao';
import { Pendencia, Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-pcppendencias',
  templateUrl: './pcp-pendencias.component.html',
  styleUrls: ['./pcp-pendencias.component.scss'],
})
export class PCPPendenciasComponent implements OnInit {
  // TODO:
  // make this an enum to change in Auditor and PCP
  ignoredStatus = ['Finalizado', 'Recusado'];

  statusEnum = ['Em análise', 'Almoxarifado', 'Enviado'];
  selectedStatus: string[] = [];
  idSelectedStatus: number[] = [];

  solicitanteEnum: string[] = [];
  selectedSolicitante: string[] = [];
  idSelectedSolicitante: number[] = [];

  statusPendencia: string[] = [];
  selectedStatusPendencia: string = '';

  loading = new BehaviorSubject<boolean>(true);
  loadingAtualization = new BehaviorSubject<boolean>(true);

  minhasPendencias: Pendencias = [];
  minhasPendenciasLocal: PendenciaLocal[] = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);
  minhasPendenciasLocal$: BehaviorSubject<PendenciaLocal[]> =
    new BehaviorSubject<PendenciaLocal[]>([]);

  constructor(
    private toastrService: NbToastrService,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService,
    private _opsService: OpsService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    Object.values(StatusPendencia).forEach((_) => {
      if (typeof _ == 'string') {
        this.statusPendencia.push(_);
      }
    });

    let usuario = '';
    this._userService.getUser().subscribe((_) => (usuario = _.nome!));
    this._pendenciaService.listPendencia().subscribe({
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
                  if (lcod.CD_LOCAL == pendencia.CD_LOCAL + '') {
                    tmpPendencia.push(pendencia);
                  }
                });
                this.minhasPendenciasLocal.push({
                  local: lcod.CD_LOCAL + ' - ' + lcod.DS_LOCAL,
                  pendencias: tmpPendencia,
                });
              }
            });
            let tmpSolicitante: string[] = [];
            this.minhasPendenciasLocal.forEach((_) => {
              let teste = _.pendencias.flatMap((x) => x.USUARIO);
              tmpSolicitante.push(...teste);
            });
            // set the solicitante dropdown
            this.solicitanteEnum = Array.from(new Set(tmpSolicitante));

            this.orderByQntPendencia(this.minhasPendenciasLocal);
            this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          },
          error: (err) => {
            console.log(err);
          },
        });

        this._setTituloService.setTitle('Pendências');
        this.loading.next(false);
        this.loadingAtualization.next(false);
      },
      error: (err) => {
        this.loadingAtualization.next(false);
        this.loading.next(false);
      },
    });
  }

  alterarStatus(event: Event, pendencia: Pendencia): void {
    pendencia.MODIFICADO_POR = this._userService.getSession().nome;
    pendencia.DT_MODIFICACAO = new Date(Date.now()).toLocaleString('pt-Br');
    this.loadingAtualization.next(true);

    let elementSelect = event.target as HTMLSelectElement;
    const novoStatus = elementSelect.value.split('_')[0];

    this._pendenciaService.alterarStatus(pendencia, novoStatus).subscribe({
      next: (ret) => {
        if (ret == 1) {
          this.toastrService.success(
            'Alteração salva com sucesso!',
            'Sucesso!!!',
            {
              preventDuplicates: true,
            }
          );
          pendencia.alterado = true;
          this.loadingAtualization.next(false);
        }
      },
      error: (err) => {
        this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
          preventDuplicates: true,
        });
        this.loadingAtualization.next(false);
      },
    });
  }

  filtroDropdown() {
    this.selectedSolicitante = [];
    this.idSelectedSolicitante.forEach((x) => {
      this.selectedSolicitante.push(this.solicitanteEnum[x]);
    });
    this.selectedStatus = [];
    this.idSelectedStatus.forEach((x) => {
      this.selectedStatus.push(this.statusEnum[x]);
    });
    this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
    // se filtro status
    // verificar se o filtro solicitante está ativo e filtrar os dois
    // caso contrário filtrar somente status
    if (this.selectedSolicitante.length > 0) {
      let filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) =>
            this.selectedSolicitante.includes(p.USUARIO)
          ),
        };
        return filtered;
      });
      if (this.selectedStatus.length > 0) {
        filteredArray = filteredArray.map((_) => {
          let filtered = {
            ..._,
            pendencias: _.pendencias.filter((p) =>
              this.selectedStatus.includes(p.STATUS)
            ),
          };
          return filtered;
        });
      }
      this.orderByQntPendencia(filteredArray);
      this.minhasPendenciasLocal$.next(filteredArray);
    } else if (this.selectedStatus.length > 0) {
      let filteredArray = this.minhasPendenciasLocal.map((_) => {
        let filtered = {
          ..._,
          pendencias: _.pendencias.filter((p) =>
            this.selectedStatus.includes(p.STATUS)
          ),
        };
        return filtered;
      });
      if (this.selectedSolicitante.length > 0) {
        filteredArray = filteredArray.map((_) => {
          let filtered = {
            ..._,
            pendencias: _.pendencias.filter((p) =>
              this.selectedSolicitante.includes(p.USUARIO)
            ),
          };
          return filtered;
        });
      }
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
}

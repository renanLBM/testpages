import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { PendenciaLocal } from 'src/app/models/localFacao';
import { Pendencia, Pendencias } from 'src/app/models/pendencia';
import { OpsService } from 'src/app/services/ops.service';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-minhas-pendencias',
  templateUrl: './minhas-pendencias.component.html',
  styleUrls: ['./minhas-pendencias.component.scss'],
})
export class MinhasPendenciasComponent implements OnInit {
  ignoredStatus = ['Finalizado', 'Recusado'];

  loadingError = false;
  isEmptyList = new BehaviorSubject<boolean>(true);

  loading = new BehaviorSubject<boolean>(true);
  loadingSend = new BehaviorSubject<boolean>(true);

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
    this.isEmptyList.next(false);

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
            this.isEmptyList.next(!this.minhasPendenciasLocal.length);
            this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          },
          error: (err) => {
            this.isEmptyList.next(true);
            console.warn(err);
          },
        });

        this._setTituloService.setTitle('Minhas Pendências');
        this.loading.next(false);
      },
      error: (err) => {
        this.isEmptyList.next(true);
        this.loading.next(false);
      },
    });
  }

  confirmarRecebimento(pendencia: Pendencia): void {
    this.isEmptyList.next(true);
    this.loadingSend.next(false);
    this.loading.next(true);
    pendencia.MODIFICADO_POR = this._userService.getSession().nome;
    pendencia.DT_MODIFICACAO = new Date(Date.now()).toLocaleString('pt-Br');
    this._pendenciaService.confirmarRecebimento(pendencia).subscribe({
      next: (ret) => {
        if (ret == 1) {
          this.toastrService.success('Status atualizado!', 'Sucesso!!!', {
            preventDuplicates: true,
          });
          let idxRemoved = this.minhasPendencias.findIndex(
            (pendenciaRemoved) => {
              pendenciaRemoved.CD_PENDENCIA == pendencia.CD_PENDENCIA;
            }
          );
          this.minhasPendenciasLocal.splice(idxRemoved, 1);
          this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          this.isEmptyList.next(!!this.minhasPendenciasLocal.length);
          this.loadingSend.next(true);
          this.loading.next(false);
        }
      },
      error: (err) => {
        console.warn(err);
        this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
          preventDuplicates: true,
        });
        this.loadingSend.next(true);
        this.loading.next(false);
      },
    });
  }
}

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

  statusPendencia: string[] = [];
  selectedStatusPendencia: string = '';

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
    this._userService.getUser().subscribe((_) => (usuario = _.nome));
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

            this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          },
          error: (err) => {
            console.log(err);
          },
        });

        this._setTituloService.setTitle('Pendências');
        this.loading.next(false);
      },
      error: (err) => {
        this.isEmptyList = true;
        this.loading.next(false);
      },
    });
  }

  alterarStatus(event: Event, pendencia: Pendencia): void {
    const novoStatus = (event.target as HTMLSelectElement).value.split('_')[0];
    (event.target as HTMLSelectElement).style.setProperty('background-color', 'yellow');

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
        }
      },
      error: (err) => {
        this.toastrService.danger('Erro ao enviar a solicitação!', 'Erro!!!', {
          preventDuplicates: true,
        });
      },
    });
  }
}

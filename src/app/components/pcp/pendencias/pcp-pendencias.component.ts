import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { StatusPendencia } from 'src/app/models/enums/enumStatusPendencia';
import { Pendencia, Pendencias } from 'src/app/models/pendencia';
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

  loading = true;
  loadingError = false;
  isEmptyList = false;

  minhasPendencias: Pendencias = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);

  constructor(
    private toastrService: NbToastrService,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    Object.values(StatusPendencia).forEach((_) => {
      if (typeof(_) == 'string') {
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
        this.minhasPendencias$.next(this.minhasPendencias);
        this._setTituloService.setTitle('Pendências');
        this.loading = false;
      },
      error: (err) => {
        this.isEmptyList = true;
        this.loading = false;
      },
    });
  }

  alterarStatus(event: string, pendencia: Pendencia): void {
    console.log(event.split('_')[0], pendencia);

    this._pendenciaService.alterarStatus(pendencia).subscribe({
      next: (ret) => {
        if (ret == 1) {
          window.location.reload();
          this.toastrService.danger(
            'Erro ao enviar a solicitação!',
            'Erro!!!',
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

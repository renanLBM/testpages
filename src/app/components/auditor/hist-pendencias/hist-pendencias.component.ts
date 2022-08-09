import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pendencias } from 'src/app/models/pendencia';
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

  loading = true;
  loadingError = false;
  isEmptyList = false;

  minhasPendencias: Pendencias = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);

  constructor(
    private _location: Location,
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    let usuario = '';
    this._userService.getUser().subscribe((_) => (usuario = _.nome));
    this._pendenciaService.listPendencia(usuario).subscribe({
      next: (pendencias) => {
        this.minhasPendencias = pendencias;
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) => !this.ignoredStatus.includes(pendencia.STATUS)
        );
        this.minhasPendencias$.next(this.minhasPendencias);
        this._setTituloService.setTitle('Histórico de Pendências');
        this.loading = false;
      },
      error: (err) => {
        this.isEmptyList = true;
        this.loading = false;
      },
    });
  }

  voltar() {
    this._location.back();
  }
}

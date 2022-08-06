import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pendencias } from 'src/app/models/pendencia';
import { PendenciasService } from 'src/app/services/pendencias.service';
import { UserService } from 'src/app/services/user.service';
import { SetTitleServiceService } from 'src/app/shared/set-title-service.service';

@Component({
  selector: 'fc-minhas-pendencias',
  templateUrl: './minhas-pendencias.component.html',
  styleUrls: ['./minhas-pendencias.component.scss'],
})
export class MinhasPendenciasComponent implements OnInit {
  loading = true;
  loadingError = false;
  isEmptyList = false;

  minhasPendencias: Pendencias = [];
  minhasPendencias$: BehaviorSubject<Pendencias> =
    new BehaviorSubject<Pendencias>([]);

  constructor(
    private _setTituloService: SetTitleServiceService,
    private _userService: UserService,
    private _pendenciaService: PendenciasService
  ) {}

  ngOnInit(): void {
    this._setTituloService.setTitle('Carregando...');

    let usuario = '';
    this._userService.getUser().subscribe((_) => usuario = _.nome)
    this._pendenciaService.listPendencia(usuario).subscribe({
      next: pendencias => {
        this.minhasPendencias = pendencias;
        this.loading = false;
        this.minhasPendencias$.next(this.minhasPendencias);
        this._setTituloService.setTitle('Minhas Pendências');
      },
      error: err => {
        this.isEmptyList = true;
        this.loading = false;
      }
    });
  }
}

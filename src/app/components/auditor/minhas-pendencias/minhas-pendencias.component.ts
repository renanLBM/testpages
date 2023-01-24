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

  localEnum: string[] = [];
  selectedLocal: string[] = [];
  idSelectedLocal: number[] = [];

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

    let usuario = 0;
    this._userService.getUser().subscribe((_) => (usuario = _.CD_USUARIO!));
    this._pendenciaService.listPendencia(usuario, 1).subscribe({
      next: (pendencias) => {
        this.minhasPendencias = JSON.parse(pendencias.data);
        this.minhasPendencias = this.minhasPendencias.filter(
          (pendencia) =>
            !this.ignoredStatus.includes(pendencia.DS_STATUS_PENDENCIA)
        );

        this.minhasPendencias.forEach((pendencia) => {
          pendencia.display_name = !!pendencia.CORTE
            ? pendencia.CD_PRODUTO_MP +
              ' - ' +
              pendencia.DS_PRODUTO_MP +
              ' - ' +
              pendencia.CORTE
            : pendencia.CD_PRODUTO_MP + ' - ' + pendencia.DS_PRODUTO_MP;
          let dataAjustada = new Date(pendencia.DT_SOLICITACAO);
          pendencia.DT_SOLICITACAO = new Date(
            dataAjustada
          ).toLocaleString('pt-Br', { timeZone: 'UTC' });
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

        let tmpLocal = this.minhasPendenciasLocal.flatMap((x) => x.local);
        // set the solicitante dropdown
        this.localEnum = Array.from(new Set(tmpLocal));

        this.isEmptyList.next(!this.minhasPendenciasLocal.length);
        this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);

        this._setTituloService.setTitle('Minhas Pendências');
        this.loading.next(false);
      },
      error: (err) => {
        console.error(err);
        this.isEmptyList.next(true);
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

  confirmarRecebimento(pendencia: Pendencia): void {
    this.isEmptyList.next(true);
    this.loadingSend.next(false);
    this.loading.next(true);
    pendencia.MODIFICADO_POR = this._userService.getSession().nome;
    let usuarioSolicitante = pendencia.CD_USUARIO;
    pendencia.CD_USUARIO = this._userService.getSession().CD_USUARIO || 0;
    pendencia.DT_MODIFICACAO = new Date(Date.now()).toLocaleString('pt-Br');

    pendencia.CD_NovoStatus = 4;
    pendencia.DS_NovoStatus = 'Finalizado';
    let data_ajustada = pendencia.DT_MODIFICACAO?.split(' ');
    pendencia.DT_MODIFICACAO =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];
    this._pendenciaService.editPendencia(pendencia).subscribe({
      next: (ret) => {
        if (ret == 1) {
          this.toastrService.success('Status atualizado!', 'Sucesso!!!', {
            preventDuplicates: true,
          });

          let local = this.minhasPendenciasLocal.find((local) =>
            local.local.includes(pendencia.CD_LOCAL + '')
          );

          let idxRemoved = local?.pendencias.findIndex(
            (pendenciaRemoved) =>
              pendenciaRemoved.CD_PENDENCIA == pendencia.CD_PENDENCIA
          );

          // remove o item da lista de pendencias do local
          local?.pendencias.splice(idxRemoved!, 1);

          // verifica se a lista de pendencias da facção está vazia
          let has_pendencia = local?.pendencias.length! > 0;

          // se estiver zerado remover o local da lista
          if (!has_pendencia) {
            let idxLocalRemoved = this.minhasPendenciasLocal.findIndex(
              (localRemoved) =>
                localRemoved.local.includes(pendencia.CD_LOCAL + '')
            );
            this.minhasPendenciasLocal.splice(idxLocalRemoved, 1);
          }

          pendencia.CD_USUARIO = usuarioSolicitante;
          this.minhasPendenciasLocal$.next(this.minhasPendenciasLocal);
          this.isEmptyList.next(!this.minhasPendenciasLocal.length);
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

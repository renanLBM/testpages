import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { HistPendenciasComponent } from './hist-pendencias/hist-pendencias.component';
import { ListFaccaoComponent } from './list-faccao/list-faccao.component';
import { MinhasPendenciasComponent } from './minhas-pendencias/minhas-pendencias.component';
import { PendenciaComponent } from './pendencia/pendencia.component';

const routes: Routes = [
  {
    path: '',
    component: ListFaccaoComponent
  },
  {
    path: 'descricao/:id',
    component: DescricaoFaccaoComponent
  },
  {
    path: 'pendencias/:cod',
    component: PendenciaComponent
  },
  {
    path: 'minhas_pendencias',
    component: MinhasPendenciasComponent
  },
  {
    path: 'hist_pendencias',
    component: HistPendenciasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditorRoutingModule { }

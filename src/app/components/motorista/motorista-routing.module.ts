import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { ListFaccoesComponent } from './list-faccoes/list-faccoes.component';

const routes: Routes = [
  {
    path: '',
    component: ListFaccoesComponent,
  },
  {
    path: 'descricao/:id',
    component: DescricaoFaccaoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MotoristaRoutingModule {}

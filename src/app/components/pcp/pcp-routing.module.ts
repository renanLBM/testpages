import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlteracoesComponent } from './alteracoes/alteracoes.component';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './pcp-home/pcp.component';
import { PcpDescOpsComponent } from './pcp-desc-ops/pcp-desc-ops.component';
import { PCPPendenciasComponent } from './pendencias/pcp-pendencias.component';

const routes: Routes = [
  {
    path: '',
    component: PcpComponent
  },
  {
    path: 'descricao/:status',
    component: DescricaoStatusComponent,
  },
  {
    path: 'descricao/:status/:origem',
    component: DescricaoStatusComponent,
  },
  {
    path: 'ops-descricao/:status/:faccaoid',
    component: PcpDescOpsComponent,
  },
  {
    path: 'ops-descricao/:status/:faccaoid/:origem',
    component: PcpDescOpsComponent,
  },
  {
    path: 'alteracoes',
    component: AlteracoesComponent,
  },
  {
    path: 'pendencias',
    component: PCPPendenciasComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PCPRoutingModule { }

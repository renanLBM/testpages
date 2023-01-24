import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlteracoesComponent } from './alteracoes/alteracoes.component';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { HistPendenciaComponent } from './hist-pendencia/hist-pendencia.component';
import { PcpDescOpsComponent } from './pcp-desc-ops/pcp-desc-ops.component';
import { PcpComponent } from './pcp-home/pcp.component';
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
  },
  {
    path: 'hist_pendencias',
    component: HistPendenciaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PCPRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './list-status/pcp.component';

// import { AdminGuard } from 'src/app/guard/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: PcpComponent
  },
  {
    path: 'descricao/:status',
    component: DescricaoStatusComponent,
    // canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PCPRoutingModule { }

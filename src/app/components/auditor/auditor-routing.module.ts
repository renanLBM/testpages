import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { ListFaccaoComponent } from './list-faccao/list-faccao.component';

// import { AdminGuard } from 'src/app/guard/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: ListFaccaoComponent
  },
  {
    path: 'descricao/:id',
    component: DescricaoFaccaoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditorRoutingModule { }

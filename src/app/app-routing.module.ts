import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DescricaoFaccaoComponent } from './components/descricao-faccao/descricao-faccao.component';
import { ListFaccaoComponent } from './components/list-faccao/list-faccao.component';
import { PcpComponent } from './components/pcp/pcp.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  //   canActivate: [LoginPageGuard],
  // },
  {
    path: 'home',
    component: ListFaccaoComponent,
    // canActivate: [LoginGuard],
  },
  {
    path: 'faccao/:id',
    component: DescricaoFaccaoComponent
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule),
  //   canActivate: [AdminLoginGuard]
  // }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

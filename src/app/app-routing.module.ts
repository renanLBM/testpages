import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    // canActivate: [LoginPageGuard],
  },
  {
    path: 'pcp',
    loadChildren: () => import('../app/components/pcp/pcp.module').then(m => m.PcpModule),
    // canActivate: [LoginGuard]
  },
  {
    path: 'auditor',
    loadChildren: () => import('../app/components/auditor/auditor.module').then(m => m.AuditorModule),
    // canActivate: [LoginGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditorGuard } from './guard/auditor.guard';
import { LoginGuard } from './guard/login.guard';
import { MotoristaGuard } from './guard/motorista.guard';
import { PcpGuard } from './guard/pcp.guard';
import { AuthenticationComponent } from './shared/components/authentication/authentication.component';
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
    canActivate: [LoginGuard],
    component: LoginComponent,
  },
  // {
  //   path: '',
  //   component: AuthenticationComponent,
  //   children: [
  //     {path: 'login', component: LoginComponent}
  //   ]
  // },
  {
    path: 'pcp',
    canLoad: [PcpGuard],
    loadChildren: () =>
      import('../app/components/pcp/pcp.module').then((m) => m.PcpModule),
  },
  {
    path: 'auditor',
    canLoad: [AuditorGuard],
    loadChildren: () =>
      import('../app/components/auditor/auditor.module').then(
        (m) => m.AuditorModule
      ),
  },
  {
    path: 'motorista',
    canLoad: [MotoristaGuard],
    loadChildren: () =>
      import('../app/components/motorista/motorista.module').then(
        (m) => m.MotoristaModule
      ),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

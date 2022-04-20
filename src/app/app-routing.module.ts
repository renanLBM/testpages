import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditorGuard } from './guard/auditor.guard';
import { LoginGuard } from './guard/login.guard';
import { PcpGuard } from './guard/pcp.guard';
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
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

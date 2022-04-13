import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guard/login.guard';
import { NivelGuard } from './guard/nivel.guard';
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
    loadChildren: () => import('../app/components/pcp/pcp.module').then(m => m.PcpModule),
    // canActivateChild: [NivelGuard]
  },
  {
    path: 'auditor',
    loadChildren: () => import('../app/components/auditor/auditor.module').then(m => m.AuditorModule),
    // canActivateChild: [NivelGuard]
  },
  {
    path: '**',
    component: NotFoundComponent,
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

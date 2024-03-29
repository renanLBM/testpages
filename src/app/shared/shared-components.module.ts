import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbButtonGroupModule,
  NbButtonModule,
  NbCardModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbPopoverModule,
  NbSelectModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbToggleModule,
  NbWindowModule,
} from '@nebular/theme';
import { DataTablesModule } from 'angular-datatables';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { CardComponent } from './components/card/card.component';
import { CarosselComponent } from './components/carossel/carossel.component';
import { DialogTableOpComponent } from './components/dialog-table-op/dialog-table-op.component';
import { DialogTableComponent } from './components/dialog-table/dialog-table.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DialogDefaultComponent } from './components/dialog-default/dialog-default.component';
import { DialogDefaultBodyComponent } from './components/dialog-default-body/dialog-default-body.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { DialogHistComponent } from './components/dialog-hist/dialog-hist.component';

@NgModule({
  declarations: [
    CardComponent,
    CarosselComponent,
    DialogComponent,
    DialogTableComponent,
    DialogTableOpComponent,
    HeaderComponent,
    LoginComponent,
    NotFoundComponent,
    DialogDefaultComponent,
    DialogDefaultBodyComponent,
    AuthenticationComponent,
    DialogHistComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NbButtonModule,
    NbButtonGroupModule,
    NbCardModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forChild(),
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbPopoverModule,
    NbSidebarModule,
    NbSelectModule,
    NbSpinnerModule,
    NbToggleModule,
    NbWindowModule.forChild(),
    NgxUsefulSwiperModule,
  ],
  exports: [
    CardComponent,
    CarosselComponent,
    DialogComponent,
    DialogTableComponent,
    DialogTableOpComponent,
    HeaderComponent,
    LoginComponent,
    NotFoundComponent,
  ],
})
export class SharedComponentsModule {}

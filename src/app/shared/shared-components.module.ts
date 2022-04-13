import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
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
  NbToggleModule, NbWindowModule
} from '@nebular/theme';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { CardComponent } from './components/card/card.component';
import { CarosselComponent } from './components/carossel/carossel.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  declarations: [
    CardComponent,
    CarosselComponent,
    DialogComponent,
    HeaderComponent,
    LoginComponent,
    NotFoundComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbCardModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
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
    HeaderComponent,
    LoginComponent,
    NotFoundComponent,
  ],
})
export class SharedComponentsModule {}

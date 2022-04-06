import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';
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
  NbSidebarModule,
  NbSpinnerModule,
  NbToggleModule
} from '@nebular/theme';
import { HeaderComponent } from './components/header/header.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    CardComponent,
    DialogComponent,
    HeaderComponent,
    NotFoundComponent,
    LoginComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbCardModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbPopoverModule,
    NbSidebarModule,
    NbSpinnerModule,
    NbToggleModule,
  ],
  exports: [
    CardComponent,
    DialogComponent,
    HeaderComponent,
    NotFoundComponent,
    LoginComponent,
  ]
})
export class SharedComponentsModule { }

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbDialogModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSearchModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbThemeModule,
  NbToggleModule
} from '@nebular/theme';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DescricaoFaccaoComponent } from './components/auditor/descricao-faccao/descricao-faccao.component';
import { ListFaccaoComponent } from './components/auditor/list-faccao/list-faccao.component';
import { PcpComponent } from './components/pcp/pcp.component';
import { CardComponent } from './shared/components/card/card.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DialogComponent } from './shared/components/dialog/dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InterceptorService } from './services/interceptor.service';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    HeaderComponent,
    NotFoundComponent,
    PcpComponent,
    ListFaccaoComponent,
    DescricaoFaccaoComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbFormFieldModule,
    NbSearchModule,
    NbSidebarModule,
    NbSpinnerModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbToggleModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

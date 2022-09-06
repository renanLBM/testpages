import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbLayoutModule,
  NbMenuModule,
  NbRouteTabsetModule,
  NbSidebarModule,
  NbTabsetModule,
  NbThemeModule,
  NbToastrModule,
} from '@nebular/theme';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginGuard } from './guard/login.guard';
import { AppUpdateService } from './providers/app-update.service';
import { InterceptorService } from './services/interceptor.service';
import { SharedComponentsModule } from './shared/shared-components.module';

registerLocaleData(localePt, 'pt-BR');
const config = {
  apiKey: 'AIzaSyBE98mwPMC231luRJ8h9Zr_EbvSqe40axA',
  authDomain: 'lbm-intranet-bi.firebaseapp.com',
  databaseURL: 'https://lbm-intranet-bi-default-rtdb.firebaseio.com',
  projectId: 'lbm-intranet-bi',
  storageBucket: 'lbm-intranet-bi.appspot.com',
  messagingSenderId: '288124378021',
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule, // auth
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbLayoutModule,
    NbMenuModule.forRoot(),
    NbRouteTabsetModule,
    NbSidebarModule.forRoot(),
    NbTabsetModule,
    NbToastrModule.forRoot(),
    NbEvaIconsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    SharedComponentsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    FontAwesomeModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ],
  providers: [
    AppUpdateService,
    LoginGuard,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

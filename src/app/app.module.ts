import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbThemeModule } from '@nebular/theme';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginGuard } from './guard/login.guard';
import { NivelGuard } from './guard/nivel.guard';
import { InterceptorService } from './services/interceptor.service';
import { SharedComponentsModule } from './shared/shared-components.module';

registerLocaleData(localePt);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NbEvaIconsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    SharedComponentsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    FontAwesomeModule,
  ],
  providers: [
    LoginGuard,
    NivelGuard,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

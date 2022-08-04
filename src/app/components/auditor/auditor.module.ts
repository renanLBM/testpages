import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbContextMenuModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTagModule,
  NbToastrModule,
  NbTooltipModule,
} from '@nebular/theme';
import {
  LazyLoadImageModule,
  LAZYLOAD_IMAGE_HOOKS,
  ScrollHooks,
} from 'ng-lazyload-image';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';

import { AuditorRoutingModule } from './auditor-routing.module';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { ListFaccaoComponent } from './list-faccao/list-faccao.component';
import { PendenciaComponent } from './pendencia/pendencia.component';

@NgModule({
  declarations: [
    ListFaccaoComponent,
    DescricaoFaccaoComponent,
    PendenciaComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuditorRoutingModule,
    SharedComponentsModule,
    InfiniteScrollModule,
    LazyLoadImageModule,
    ScrollingModule,
    NbAlertModule,
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
    NbLayoutModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTagModule,
    NbTooltipModule,
    NbToastrModule.forRoot(),
  ],
  providers: [{ provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }],
})
export class AuditorModule {}

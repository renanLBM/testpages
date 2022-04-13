import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSpinnerModule, NbTooltipModule } from '@nebular/theme';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { AuditorRoutingModule } from './auditor-routing.module';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { ListFaccaoComponent } from './list-faccao/list-faccao.component';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';



@NgModule({
  declarations: [
    ListFaccaoComponent,
    DescricaoFaccaoComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    LazyLoadImageModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
    NbLayoutModule,
    NbSpinnerModule,
    NbTooltipModule,
    AuditorRoutingModule,
    SharedComponentsModule
  ],
  providers: [
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }
  ]
})
export class AuditorModule { }

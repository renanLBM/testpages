import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSpinnerModule
} from '@nebular/theme';
import {
  LazyLoadImageModule,
  LAZYLOAD_IMAGE_HOOKS,
  ScrollHooks
} from 'ng-lazyload-image';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { ListFaccoesComponent } from './list-faccoes/list-faccoes.component';
import { MotoristaRoutingModule } from './motorista-routing.module';


@NgModule({
  declarations: [ListFaccoesComponent, DescricaoFaccaoComponent],
  imports: [
    CommonModule,
    FormsModule,
    MotoristaRoutingModule,
    SharedComponentsModule,
    LazyLoadImageModule,
    NbButtonModule,
    NbCardModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbSpinnerModule,
  ],
  providers: [{ provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks }],
})
export class MotoristaModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule } from '@nebular/theme';
import { ListFaccaoComponent } from './list-faccao/list-faccao.component';
import { DescricaoFaccaoComponent } from './descricao-faccao/descricao-faccao.component';
import { AuditorRoutingModule } from './auditor-routing.module';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ListFaccaoComponent,
    DescricaoFaccaoComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    NbButtonModule,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
    NbCheckboxModule,
    NbLayoutModule,
    AuditorRoutingModule,
    SharedComponentsModule
  ]
})
export class AuditorModule { }

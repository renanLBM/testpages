import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule } from '@nebular/theme';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './list-status/pcp.component';
import { PCPRoutingModule } from './pcp-routing.module';



@NgModule({
  declarations: [
    PcpComponent,
    DescricaoStatusComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    PCPRoutingModule,
    SharedComponentsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
  ]
})
export class PcpModule { }

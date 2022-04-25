import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSpinnerModule, NbTooltipModule, NbTreeGridModule } from '@nebular/theme';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './list-status/pcp.component';
import { PCPRoutingModule } from './pcp-routing.module';
import { DataTablesModule } from 'angular-datatables';



@NgModule({
  declarations: [
    PcpComponent,
    DescricaoStatusComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    DataTablesModule,
    PCPRoutingModule,
    SharedComponentsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbTreeGridModule,
    NbTooltipModule
  ]
})
export class PcpModule { }

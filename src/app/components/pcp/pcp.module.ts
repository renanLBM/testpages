import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTooltipModule
} from '@nebular/theme';
import { DataTablesModule } from 'angular-datatables';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './list-status/pcp.component';
import { PcpDescOpsComponent } from './pcp-desc-ops/pcp-desc-ops.component';
import { PCPRoutingModule } from './pcp-routing.module';

@NgModule({
  declarations: [PcpComponent, DescricaoStatusComponent, PcpDescOpsComponent],
  imports: [
    RouterModule,
    CommonModule,
    DataTablesModule,
    FontAwesomeModule,
    PCPRoutingModule,
    SharedComponentsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTooltipModule,
  ],
})
export class PcpModule {}

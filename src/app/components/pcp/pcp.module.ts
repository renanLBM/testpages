import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbTreeGridModule,
} from '@nebular/theme';
import { DataTablesModule } from 'angular-datatables';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { AlteracoesComponent, FsIconComponent } from './alteracoes/alteracoes.component';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { PcpComponent } from './pcp-home/pcp.component';
import { PcpDescOpsComponent } from './pcp-desc-ops/pcp-desc-ops.component';
import { PCPRoutingModule } from './pcp-routing.module';

@NgModule({
  declarations: [
    PcpComponent,
    DescricaoStatusComponent,
    PcpDescOpsComponent,
    AlteracoesComponent,
    FsIconComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    DataTablesModule,
    FontAwesomeModule,
    PCPRoutingModule,
    SharedComponentsModule,
    NbAlertModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTreeGridModule,
    NbTooltipModule,
  ],
})
export class PcpModule {}

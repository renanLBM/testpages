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
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbSelectModule,
  NbSpinnerModule,
  NbToastrModule,
  NbTooltipModule,
  NbTreeGridModule
} from '@nebular/theme';
import { DataTablesModule } from 'angular-datatables';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';

import {
  AlteracoesComponent,
  FsIconComponent
} from './alteracoes/alteracoes.component';
import { DescricaoStatusComponent } from './descricao-status/descricao-status.component';
import { HistPendenciaComponent } from './hist-pendencia/hist-pendencia.component';
import { PcpDescOpsComponent } from './pcp-desc-ops/pcp-desc-ops.component';
import { PcpComponent } from './pcp-home/pcp.component';
import { PCPRoutingModule } from './pcp-routing.module';
import { PCPPendenciasComponent } from './pendencias/pcp-pendencias.component';

@NgModule({
  declarations: [
    AlteracoesComponent,
    DescricaoStatusComponent,
    PcpComponent,
    PcpDescOpsComponent,
    PCPPendenciasComponent,
    FsIconComponent,
    HistPendenciaComponent
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
    NbFormFieldModule,
    NbLayoutModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTreeGridModule,
    NbTooltipModule,
    NbToastrModule.forRoot(),
  ],
})
export class PcpModule {}

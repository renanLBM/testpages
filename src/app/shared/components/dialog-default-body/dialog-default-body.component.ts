import { Component, Input } from '@angular/core';
import { NbDialogRef,
  NbToastrService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { MotivoPendencia } from 'src/app/models/enums/enumMotivoPendencia';
import { Pendencias } from 'src/app/models/pendencia';
import { PendenciasService } from 'src/app/services/pendencias.service';

@Component({
  selector: 'fc-dialog-default-body',
  templateUrl: './dialog-default-body.component.html',
  styleUrls: ['./dialog-default-body.component.scss'],
})
export class DialogDefaultBodyComponent {
  @Input() title: string = '';
  @Input() bodyText: string = '';
  @Input() buttonName: string = '';
  @Input() solicitacao: Pendencias = [];

  selectedMotivo!: number;
  motivoList: string[] = [];
  loading = new BehaviorSubject<boolean>(false);

  constructor(
    protected dialogRef: NbDialogRef<DialogDefaultBodyComponent>,
    private toastrService: NbToastrService,
    private _pendenciaService: PendenciasService
  ) {
    let situacaoEnum = Object.values(MotivoPendencia).filter(
      (value) => typeof value === 'string'
    );
    for (let [i, item] of situacaoEnum.entries()) {
      this.motivoList.push((item) as string);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.loading.next(true);
    if (this.title == 'Motivo da Pendência') {
      let motivo = MotivoPendencia[this.selectedMotivo];
      if(!motivo){
        this.toastrService.warning(
          'Preencha o motivo!',
          'Atenção!',
          {
            preventDuplicates: true,
          }
        );
        return;
      }
      this.solicitacao.forEach((_) => {
        _.MOTIVO = motivo;
        _.CD_MOTIVO = this.selectedMotivo+1;
      });
      this._pendenciaService.setPendencia(this.solicitacao).subscribe({
        next: (res) => {
          this.loading.next(false);
          return this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading.next(false);
          return this.dialogRef.close(false);
        },
      });
    }else{
      this.loading.next(false);
      this.dialogRef.close(true);
    }
  }
}

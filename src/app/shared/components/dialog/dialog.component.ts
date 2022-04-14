import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { descOP } from 'src/app/models/descOP';
import { Motivo } from 'src/app/models/motivo';
import { AuditorService } from 'src/app/services/auditor.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'fc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  user = '';
  motivos = [
    'Alterado sequencia de produção',
    'Atraso de aviamento',
    'Atraso da facção',
    'Complexidade alta',
    'Conserto',
    'Reposição de corte',
    'Reprovado na inspeção',
  ];

  err: boolean = false;

  novoMotivo!: Motivo;
  @Input() prevOP!: descOP;
  @Input() prev: string = '';
  @Input() i_motivo: string = '';

  dialogForm = new FormGroup({
    motivoControl: new FormControl(),
    dtControl: new FormControl(),
  });

  selectedControl = 2;
  removed: boolean = false;
  min: Date = new Date(new Date().setHours(-1));

  constructor(
    protected dialogRef: NbDialogRef<DialogComponent>,
    private _userService: UserService,
    private _auditorService: AuditorService
  ) { }

  remove() {
    this.prev = '';
    this.removed = true;
    this.dialogRef.close({ prev: '', removed: this.removed });
  }

  cancel() {
    this.dialogRef.close({ prev: this.prev, removed: this.removed });
  }

  submit() {
    let nMotivo = this.dialogForm.value;
    let novaData = '';

    if (nMotivo.dtControl) {
      novaData = new Date(nMotivo.dtControl)
        .toLocaleString('pt-Br')
        .substring(0, 10);
    } else {
      novaData = this.prev;
    }

    this.user = JSON.parse(this._userService.getSession()).nome;

    this.novoMotivo = {
      NR_CICLO: this.prevOP.ciclo!,
      NR_OP: this.prevOP.op!,
      CD_REFERENCIA: this.prevOP.ref,
      PREV_RETORNO: this.prevOP.previsao,
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      NOVA_PREVISAO: novaData,
      MOTIVO: this.motivos[nMotivo.motivoControl],
      USUARIO: this.user,
      DT_INSERIDO: new Date().toLocaleString('pt-Br'),
    };

    if (this.novoMotivo.MOTIVO && this.novoMotivo.NOVA_PREVISAO) {
      this._auditorService.setMotivo(this.novoMotivo);
      this.dialogRef.close({ prev: novaData, removed: this.removed });
    }

    this.err = true;
  }
}

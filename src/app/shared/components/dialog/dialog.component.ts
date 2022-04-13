import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { descOP } from 'src/app/models/descOP';
import { Motivo } from 'src/app/models/motivo';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'fc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
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
  ]

  err: boolean = false;

  novoMotivo!: Motivo;
  @Input() prevOP!: descOP;
  @Input() prev: string = '';

  dialogForm = new FormGroup({
    motivoControl: new FormControl(),
    dtControl: new FormControl()
  })

  removed: boolean = false;
  min: Date = new Date(new Date().setHours(-1));

  constructor(protected dialogRef: NbDialogRef<DialogComponent>, private _userService: UserService) { }

  remove() {
    this.prev = '';
    this.removed = true;
    this.dialogRef.close({prev: '', removed: this.removed});
  }

  cancel() {
    this.dialogRef.close({prev: this.prev, removed: this.removed});
  }

  submit() {

    this.user = JSON.parse(this._userService.getSession()).nome;

    let nMotivo = this.dialogForm.value;
    let novaData = new Date().toLocaleString('pt-Br').substring(0, 10);

    console.log(nMotivo.dtControl);

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
      DT_INSERIDO: new Date().toLocaleString('pt-Br')
    }

    if (!nMotivo.motivoControl || !nMotivo.dtControl) {
      this.err = true;
    }else {
      this.dialogRef.close({prev: novaData, removed: this.removed});
    }

  }

}

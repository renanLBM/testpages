import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Prev, Prevs } from 'src/app/models/previsao';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'fc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {

  @Input() prev: string = '';

  removed: boolean = false;

  min: Date = new Date(new Date().setHours(-1));

  constructor(protected dialogRef: NbDialogRef<DialogComponent>) { }

  remove() {
    this.prev = '';
    this.removed = true;
    this.dialogRef.close({prev: '', removed: this.removed});
  }

  cancel() {
    this.dialogRef.close({prev: this.prev, removed: this.removed});
  }

  submit(dtcontrol: string) {
    this.dialogRef.close({prev: dtcontrol, removed: this.removed});
  }

}

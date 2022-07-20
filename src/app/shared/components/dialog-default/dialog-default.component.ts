import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { DialogDefaultBodyComponent } from '../dialog-default-body/dialog-default-body.component';

@Component({
  selector: 'fc-dialog-default',
  templateUrl: './dialog-default.component.html',
  styleUrls: ['./dialog-default.component.scss']
})
export class DialogDefaultComponent {

  @Input() title: string = '';
  @Input() bodyText: string = '';
  @Input() buttonName: string = '';

  constructor(protected dialogRef: NbDialogRef<DialogDefaultComponent>) {}

  submit() {
    this.dialogRef.close(true);
  }

}

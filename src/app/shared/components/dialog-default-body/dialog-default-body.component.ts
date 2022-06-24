import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'fc-dialog-default-body',
  templateUrl: './dialog-default-body.component.html',
  styleUrls: ['./dialog-default-body.component.scss'],
})
export class DialogDefaultBodyComponent {
  @Input() title: string = '';
  @Input() bodyText: string = '';
  @Input() buttonName: string = '';

  constructor(protected dialogRef: NbDialogRef<DialogDefaultBodyComponent>) {}

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(true);
  }
}

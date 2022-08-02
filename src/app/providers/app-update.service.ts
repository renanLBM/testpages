import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { NbDialogService } from '@nebular/theme';
import { DialogDefaultBodyComponent } from '../shared/components/dialog-default-body/dialog-default-body.component';

@Injectable({
  providedIn: 'root',
})
export class AppUpdateService {
  constructor(
    private readonly updates: SwUpdate,
    private dialogService: NbDialogService
  ) {
    this.updates.available.subscribe((event) => {
      this.showAppUpdateAlert();
    });
  }

  showAppUpdateAlert() {
    const header = 'Atualização v0.2.46';
    const message = "\
              ➤ Adicionado o componente 'Pendências' no módulo Auditor; \
              ➤ O item pode ser encontrado no menu da descrição da OP; \
          ";


    this.dialogService.open(DialogDefaultBodyComponent, {
      closeOnBackdropClick: false,
      hasBackdrop: true,
      context: {
        title: header,
        bodyText: message,
        buttonName: 'Ok',
      },
    }).onClose.subscribe((x) => {
      if(x){
        this.doAppUpdate();
      }
    });
  }

  doAppUpdate() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}

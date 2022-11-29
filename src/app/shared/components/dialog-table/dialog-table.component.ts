import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BehaviorSubject, Subject } from 'rxjs';
import { Motivos } from 'src/app/models/motivo';
import { LanguagePtBr } from 'src/app/models/ptBr';

@Component({
  selector: 'fc-dialog-table',
  templateUrl: './dialog-table.component.html',
  styleUrls: ['./dialog-table.component.scss'],
})
export class DialogTableComponent implements OnDestroy, OnInit {
  @Input() motivos: Motivos = [];
  @Input() status: string = '';
  @Input() name: string = '';

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  emptyList: boolean = false;
  motivoList$: BehaviorSubject<Motivos> = new BehaviorSubject(this.motivos);

  constructor(protected _dialogRef: NbDialogRef<DialogTableComponent>) {}

  ngOnInit(): void {
    if (this.motivos.length == 0) {
      this.emptyList = true;
    }

    this.motivos.sort((a, b) => {
      return a.DT_PREV_RETORNO_NOVA > b.DT_PREV_RETORNO_NOVA ? 1 : -1;
    });
    this.dtOptions = {
      language: LanguagePtBr.ptBr_datatable,
      pagingType: 'full_numbers',
      pageLength: 5,
      order: [[2, 'desc']],
    };

    this.motivoList$.next(this.motivos);
    this.dtTrigger.next(this.dtOptions);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

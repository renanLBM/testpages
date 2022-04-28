import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { BehaviorSubject, Subject } from 'rxjs';
import { Motivos } from 'src/app/models/motivo';
import { OPs } from 'src/app/models/ops';
import { LanguagePtBr } from 'src/app/models/ptBr';

@Component({
  selector: 'fc-dialog-table-op',
  templateUrl: './dialog-table-op.component.html',
  styleUrls: ['./dialog-table-op.component.scss']
})
export class DialogTableOpComponent implements OnDestroy, OnInit {
  @Input() motivos: Motivos = [];
  @Input() ops: OPs = [];
  @Input() status: string = '';
  @Input() name: string = '';

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  emptyList: boolean = false;
  opsList$: BehaviorSubject<OPs> = new BehaviorSubject(this.ops);

  constructor(protected dialogRef: NbDialogRef<DialogTableOpComponent>) {}

  ngOnInit(): void {
    if (this.ops.length == 0) {
      this.emptyList = true;
    }
    this.dtOptions = {
      language: LanguagePtBr.ptBr_datatable,
      pagingType: 'full_numbers',
      pageLength: 5,
      order: [[2, 'desc']],
    };

    this.opsList$.next(this.ops);
    this.opsList$.subscribe((x) => this.dtTrigger.next(this.dtOptions));
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}

import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { EMPTY, Observable } from 'rxjs';
import { descOP } from 'src/app/models/descOP';
import { LogApontamentos } from 'src/app/models/logApontamento';
import { LogAtrasos } from 'src/app/models/logAtraso';
import { ApontamentoService } from 'src/app/services/apontamento.service';
import { AtrasoService } from 'src/app/services/atraso.service';

@Component({
  selector: 'fc-dialog-hist',
  templateUrl: './dialog-hist.component.html',
  styleUrls: ['./dialog-hist.component.scss'],
})
export class DialogHistComponent implements OnInit {
  datePipe = new DatePipe('pt-Br');
  MAIS_3_HORAS_MILISSEGUNDOS = 10800000;

  isAtraso = false;
  isApontamento = false;

  logAlteracoes$!: Observable<LogAtrasos>;
  logApontamentos$!: Observable<LogApontamentos>;

  @Input() prevOP!: descOP;
  @Input() tipo: string = '';

  constructor(
    protected dialogRef: NbDialogRef<DialogHistComponent>,
    private _atrasoService: AtrasoService,
    private _apontamentoService: ApontamentoService
  ) {}

  ngOnInit(): void {
    console.log(
      this.tipo,
      this.prevOP.cd_local.toString(),
      this.prevOP.NR_REDUZIDOOP.toString()
    );
    this.isAtraso = this.tipo == 'Histórico Previsão';
    this.isApontamento = this.tipo == 'Histórico Apontamento';

    if (this.isAtraso) {
      console.log('object');
      this.logAlteracoes$ = this._atrasoService.logMotivos(
        this.prevOP.cd_local.toString(),
        this.prevOP.NR_REDUZIDOOP.toString()
      );
    } else if (this.isApontamento) {
      console.log(
        this.tipo,
        this.prevOP.cd_local.toString(),
        this.prevOP.NR_REDUZIDOOP.toString()
      );
      this.logApontamentos$ = this._apontamentoService.logApontamento(
        this.prevOP.cd_local.toString(),
        this.prevOP.NR_REDUZIDOOP.toString()
      );
    }
  }

  cancel(): void {
    this.logAlteracoes$ = EMPTY;
    this.logApontamentos$ = EMPTY;
    this.dialogRef.close({});
  }
}

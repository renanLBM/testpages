import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Apontamento } from 'src/app/models/apontamento';
import { descOP } from 'src/app/models/descOP';
import { Motivo } from 'src/app/models/motivo';
import { AuditorService } from 'src/app/services/auditor.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'fc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  loading = false;

  latitude = 0;
  longitude = 0;
  retorno!: number;

  user = '';
  motivosAtraso = [
    'Alterado sequencia de produção',
    'Atraso de aviamento',
    'Atraso da facção',
    'Complexidade alta',
    'Conserto',
    'Modelagem',
    'Reposição de corte',
    'Reprovado na inspeção',
    'Sacrifício',
  ];
  situacaoList = [
    'Em fila',
    'Em produção',
    'Parado',
    'Em inspeção',
    'Disponível para coleta',
  ];

  err: boolean = false;

  novoApontamento!: Apontamento;
  novoMotivo!: Motivo;
  @Input() prevOP!: descOP;
  @Input() prev: string = '';
  @Input() i_motivo: string = '';
  @Input() tipo: string = '';
  @Input() situacao: string = '';

  selected!: number;
  apontamento: boolean = false;

  dialogForm = new FormGroup({
    motivoControl: new FormControl(),
    dtControl: new FormControl(),
    situacaoControl: new FormControl(),
  });

  removed: boolean = false;
  min: Date = new Date(new Date().setHours(-1));

  constructor(
    protected dialogRef: NbDialogRef<DialogComponent>,
    private _userService: UserService,
    private _auditorService: AuditorService
  ) {}

  ngOnInit(): void {
    let dateInput = document.getElementById('dateInput');
    dateInput?.blur();
    dateInput?.setAttribute('readonly', 'readonly'); // Force mobile keyboard to hide on input field.

    this.loading = false;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitude = pos.coords.latitude;
          this.longitude = pos.coords.longitude;
        },
        (err) => console.error(`ERROR(${err.code}) ${err.message}`),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }

  remove(): void {
    this.loading = true;

    this.prev = '';
    this.removed = true;
    this.i_motivo = '';
    this.user = this._userService.getSession().nome;

    this.novoMotivo = {
      cod: '',
      CD_LOCAL: this.prevOP.cd_local,
      NR_CICLO: this.prevOP.ciclo!,
      NR_OP: this.prevOP.op!,
      CD_REFERENCIA: this.prevOP.ref,
      PREV_RETORNO: this.prevOP.previsao,
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      Situacao: '',
      NOVA_PREVISAO: '',
      MOTIVO: 'removido',
      USUARIO: this.user,
      DT_INSERIDO: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    this._auditorService.removeMotivo(this.novoMotivo);
    this._auditorService.removeMotivo(this.novoMotivo).subscribe({
      next: (ret) => {
        this.dialogRef.close({
          prev: '',
          motivo: this.i_motivo,
          removed: this.removed,
        });
      },
      error: (err) => {
        alert(`ERROR(${err.code}) ${err.message}`);
      },
    });
  }

  cancel(): void {
    this.loading = true;

    this.dialogRef.close({
      prev: this.prev,
      motivo: this.i_motivo,
      removed: this.removed,
      situacao: this.situacao
    });
  }

  submit(): void {
    let nMotivo = this.dialogForm.value;

    // if the selected menu is equals to apontamento, will call the correct method and exit the submit when completed
    if (this.apontamento) {
      this.submitiApontamento();
      return;
    }
    let dataInserida = new Date(nMotivo.dtControl);

    // the hours of dataInserida is equals to 00:00
    // needed to sum 23 hours in miliseconds to validation
    // also verify if the motivo input was inserted
    if (dataInserida.getTime() + 82800000 < new Date().getTime()) {
      this.err = true;
      this.loading = false;
      return;
    }

    let novaDataForm = '';
    let novoMotivoForm = '';

    novaDataForm = nMotivo.dtControl
    ? dataInserida.toLocaleString('pt-Br').substring(0, 10)
    : this.prev;
    novoMotivoForm =
    this.tipo == 'Adiantamento'
        ? this.tipo
        : this.motivosAtraso[nMotivo.motivoControl];
    this.user = this._userService.getSession().nome;

    this.novoMotivo = {
      cod: '',
      CD_LOCAL: this.prevOP.cd_local,
      NR_CICLO: this.prevOP.ciclo!,
      NR_OP: this.prevOP.op!,
      CD_REFERENCIA: this.prevOP.ref,
      PREV_RETORNO: this.prevOP.previsao,
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      NOVA_PREVISAO: novaDataForm,
      MOTIVO: novoMotivoForm,
      USUARIO: this.user,
      DT_INSERIDO: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    if (this.tipo == 'Adiantamento') {
      this.loading = true;
      this._auditorService.setMotivo(this.novoMotivo).subscribe({
        next: (ret) => {
          this.dialogRef.close({
            prev: novaDataForm,
            motivo: this.novoMotivo.MOTIVO,
            removed: this.removed,
          });
        },
        error: (err) => {
          alert(`ERROR(${err.code}) ${err.message}`);
          this.err = true;
          this.loading = false;
        },
      });
    } else if (this.novoMotivo.MOTIVO && this.novoMotivo.NOVA_PREVISAO) {
      this.loading = true;
      this._auditorService.setMotivo(this.novoMotivo).subscribe({
        next: (ret) => {
          this.dialogRef.close({
            prev: novaDataForm,
            motivo: this.novoMotivo.MOTIVO,
            removed: this.removed,
          });
        },
        error: (err) => {
          alert(`ERROR(${err.code}) ${err.message}`);
          this.err = true;
          this.loading = false;
        },
      });
    } else {
      this.err = true;
      this.loading = false;
    }
  }

  submitiApontamento(): void {
    let nApontamento = this.dialogForm.value;

    let novoApontamentoForm = this.situacaoList[nApontamento.situacaoControl];

    this.user = this._userService.getSession().nome;

    console.log(this.prevOP);

    this.novoApontamento = {
      cod: '',
      CD_LOCAL: this.prevOP.cd_local,
      NR_CICLO: this.prevOP.ciclo!,
      NR_OP: this.prevOP.op!,
      CD_REFERENCIA: this.prevOP.ref,
      PREV_RETORNO: this.prevOP.previsao,
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      Situacao: novoApontamentoForm,
      USUARIO: this.user,
      DT_INSERIDO: new Date().toLocaleString('pt-Br'),
      latitude: this.latitude,
      longitude: this.longitude,
    };

    if (novoApontamentoForm) {
      this.loading = true;
      this._auditorService.setApontamento(this.novoApontamento).subscribe({
        next: (ret) => {
          this.dialogRef.close({
            removed: this.removed,
            situacao: this.novoApontamento.Situacao,
          });
        },
        error: (err) => {
          alert(`ERROR(${err.code}) ${err.message}`);
          this.err = true;
          this.loading = false;
        },
      });
    } else {
      this.err = true;
      this.loading = false;
    }
  }
}

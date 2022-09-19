import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Apontamento } from 'src/app/models/apontamento';
import { descOP } from 'src/app/models/descOP';
import { ApontamentoList } from 'src/app/models/enums/enumApontamentos';
import { MotivoAtraso } from 'src/app/models/enums/enumMotivoAtraso';
import { ParadoList } from 'src/app/models/enums/enumParadoList';
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
  motivosAtraso = MotivoAtraso;
  situacaoList: string[] = [];
  paradoList = Object.values(ParadoList).filter(
    (value) => typeof value === 'string'
  );

  err: boolean = false;

  novoApontamento!: Apontamento;
  novoMotivo!: Motivo;
  @Input() prevOP!: descOP;
  @Input() prev: string = '';
  @Input() i_motivo: string = '';
  @Input() tipo: string = '';
  @Input() situacao: string = '';

  selected!: number;
  selectedParado: number = -1;
  apontamento: boolean = false;

  dialogForm = new UntypedFormGroup({
    motivoControl: new UntypedFormControl(),
    dtControl: new UntypedFormControl(),
    situacaoControl: new UntypedFormControl(),
    motivoParadoControl: new UntypedFormControl(),
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

    let situacaoEnum = Object.values(ApontamentoList).filter(
      (value) => typeof value === 'string'
    );
    for (let [i, item] of situacaoEnum.entries()) {
      if (
        ApontamentoList[i] != 'Em transporte' &&
        ApontamentoList[i] != 'Não informado' &&
        ApontamentoList[i] != 'Coletado'
      )
        this.situacaoList.push(('0'+i + ' - ' + item) as string);
    }

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
    this.user = this._userService.getSession().nome!;

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
      situacao: this.situacao,
    });
  }

  submit(): void {
    let nMotivo = this.dialogForm.value;

    // if the selected menu is equals to apontamento, will call the correct method and exit the submit when completed
    if (this.apontamento) {
      this.submitApontamento();
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

    let motivoSelected: number = nMotivo.motivoControl;
    novoMotivoForm =
      this.tipo == 'Adiantamento'
        ? this.tipo
        : Object.values(this.motivosAtraso)[motivoSelected];
    this.user = this._userService.getSession().nome!;

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

  submitApontamento(): void {
    this.err = false;
    let nApontamento = this.dialogForm.value;

    let selectedApontament: number = nApontamento.situacaoControl;
    let novoApontamentoForm = this.situacaoList[selectedApontament];
    let selectedMotivoParado: number = nApontamento.motivoParadoControl;
    let selectedMotivoParadoForm = this.paradoList[selectedMotivoParado];

    novoApontamentoForm = novoApontamentoForm.split(" - ")[1];

    let motivoParado = selectedMotivoParadoForm
      ? ' - ' + selectedMotivoParadoForm
      : '';
    novoApontamentoForm = novoApontamentoForm.includes('Parado')
      ? novoApontamentoForm + motivoParado
      : novoApontamentoForm;

    this.user = this._userService.getSession().nome!;


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

    if (novoApontamentoForm.match('Parado') && this.selectedParado < 0) {
      this.err = true;
      this.loading = false;
    }

    if (novoApontamentoForm && !this.err) {
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

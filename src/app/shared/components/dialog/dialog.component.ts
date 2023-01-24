import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Apontamento } from 'src/app/models/apontamento';
import { descOP } from 'src/app/models/descOP';
import {
  ApontamentoList,
  ApontamentoListParado,
} from 'src/app/models/enums/enumApontamentos';
import {
  MotivoAtraso,
  MotivoAtrasoCD,
} from 'src/app/models/enums/enumMotivoAtraso';
import { ParadoList } from 'src/app/models/enums/enumParadoList';
import { Motivo } from 'src/app/models/motivo';
import { ApontamentoService } from 'src/app/services/apontamento.service';
import { AtrasoService } from 'src/app/services/atraso.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'fc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  datePipeBr = new DatePipe('pt-Br');
  min: Date = new Date(new Date().setHours(-1));
  max: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  loading = false;

  latitude = 0;
  longitude = 0;
  retorno!: number;

  user = '';
  cd_user = 0;
  motivosAtraso = MotivoAtraso;
  DS_APONTAMENTO_DSList: string[] = [];
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
  @Input() DS_APONTAMENTO_DS: string = '';

  selected!: number;
  selectedParado: number = -1;
  apontamento: boolean = false;

  dialogForm = new UntypedFormGroup({
    motivoControl: new UntypedFormControl(),
    dtControl: new UntypedFormControl(),
    DS_APONTAMENTO_DSControl: new UntypedFormControl(),
    motivoParadoControl: new UntypedFormControl(),
  });

  removed: boolean = false;

  constructor(
    protected dialogRef: NbDialogRef<DialogComponent>,
    private _userService: UserService,
    private _atrasoService: AtrasoService,
    private _apontamentoService: ApontamentoService
  ) {}

  ngOnInit(): void {
    this.user = this._userService.getSession().nome!;
    this.cd_user = this._userService.getSession().CD_USUARIO!;
    let dateInput = document.getElementById('dateInput');
    dateInput?.blur();
    dateInput?.setAttribute('readonly', 'readonly'); // Force mobile keyboard to hide on input field.

    let prev_ajuste = this.prevOP.previsao!.split('/').reverse();
    if (this.tipo != 'Adiantamento') {
      prev_ajuste[2] = +prev_ajuste[2] + 1 + '';
      let min_prev = new Date(prev_ajuste.join('-'));
      this.min = min_prev > this.min ? min_prev : this.min;
    } else {
      prev_ajuste[2] = +prev_ajuste[2] + '';
      let max_prev = new Date(prev_ajuste.join('-'));
      this.max = max_prev < this.max ? max_prev : this.max;
    }

    let situacaoEnum = Object.values(ApontamentoList).filter(
      (value) => typeof value === 'string'
    );
    for (let [i, item] of situacaoEnum.entries()) {
      if (
        ApontamentoList[i] != 'Em transporte' &&
        ApontamentoList[i] != 'Não informado' &&
        ApontamentoList[i] != 'Coletado'
      )
        this.DS_APONTAMENTO_DSList.push(('0' + i + ' - ' + item) as string);
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
    let dt_inserido = new Date().toLocaleString('pt-Br');
    let dt_inserido_ajuste = dt_inserido.split(' ');
    dt_inserido =
      dt_inserido_ajuste[0].split('/').reverse().join('-') +
      ' ' +
      dt_inserido_ajuste[1];

    this.novoMotivo = {
      NR_REDUZIDOOP: this.prevOP.NR_REDUZIDOOP!,
      CD_LOCAL: this.prevOP.cd_local,
      DT_PREV_RETORNO: this.prevOP.previsao!,
      DT_PREV_RETORNO_NOVA: '',
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      DS_APONTAMENTO_DS: '',
      NOVA_PREVISAO: '',
      CD_ATRASO: this.prevOP.CD_ATRASO!,
      CD_ATRASO_DS: 0,
      DS_ATRASO_DS: this.prevOP.motivo_atraso!,
      CD_USUARIO: this.cd_user,
      DS_USUARIO: this.user,
      DT_INSERIDO: dt_inserido,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    this._atrasoService.removeMotivo(this.novoMotivo);
    this._atrasoService.removeMotivo(this.novoMotivo).subscribe({
      next: (ret: any) => {
        this.dialogRef.close({
          prev: '',
          motivo: this.i_motivo,
          removed: this.removed,
        });
      },
      error: (err: { code: any; message: any }) => {
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
      DS_APONTAMENTO_DS: this.DS_APONTAMENTO_DS,
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
    // also verify if the date is less then 1 year
    // 31536000000 = 1 year in milisseconds
    if (
      dataInserida.getTime() + 82800000 < new Date().getTime() ||
      dataInserida.getTime() + 82800000 > new Date().getTime() + 31536000000
    ) {
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
    let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
    let dt_modificacao =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];
    let prev_retorno_ajustado = this.prevOP
      .previsao!.split('/')
      .reverse()
      .join('-');
    novaDataForm = novaDataForm.split('/').reverse().join('-');

    this.novoMotivo = {
      CD_ATRASO: !!this.prevOP.CD_ATRASO ? this.prevOP.CD_ATRASO : 0,
      NR_REDUZIDOOP: this.prevOP.NR_REDUZIDOOP,
      CD_LOCAL: this.prevOP.cd_local,
      DT_PREV_RETORNO: prev_retorno_ajustado,
      DT_PREV_RETORNO_NOVA: '',
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      NOVA_PREVISAO: novaDataForm,
      CD_ATRASO_DS:
        MotivoAtrasoCD[novoMotivoForm as keyof typeof MotivoAtrasoCD] + 1,
      DS_ATRASO_DS: novoMotivoForm,
      CD_USUARIO: this.cd_user,
      DT_INSERIDO: dt_modificacao,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    if (this.tipo == 'Adiantamento') {
      this.loading = true;
      this._atrasoService.setMotivo(this.novoMotivo).subscribe({
        next: (ret: any) => {
          this.dialogRef.close({
            prev: novaDataForm.split('/').reverse().join('-'),
            motivo: this.novoMotivo.DS_ATRASO_DS,
            removed: this.removed,
          });
        },
        error: (err: { code: any; message: any }) => {
          alert(`ERROR(${err.code}) ${err.message}`);
          this.err = true;
          this.loading = false;
        },
      });
    } else if (this.novoMotivo.DS_ATRASO_DS && this.novoMotivo.NOVA_PREVISAO) {
      this.loading = true;
      this._atrasoService.setMotivo(this.novoMotivo).subscribe({
        next: (ret: any) => {
          this.dialogRef.close({
            prev: novaDataForm.split('/').reverse().join('-'),
            motivo: this.novoMotivo.DS_ATRASO_DS,
            removed: this.removed,
          });
        },
        error: (err: { code: any; message: any }) => {
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

    let selectedApontament: number = nApontamento.DS_APONTAMENTO_DSControl;
    let novoApontamentoForm = this.DS_APONTAMENTO_DSList[selectedApontament];
    let selectedMotivoParado: number = nApontamento.motivoParadoControl;
    let selectedMotivoParadoForm = this.paradoList[selectedMotivoParado];

    novoApontamentoForm = novoApontamentoForm.split(' - ')[1];

    let motivoParado = selectedMotivoParadoForm
      ? ' - ' + selectedMotivoParadoForm
      : '';
    novoApontamentoForm = novoApontamentoForm.includes('Parado')
      ? novoApontamentoForm + motivoParado
      : novoApontamentoForm;

    let data_ajustada = new Date().toLocaleString('pt-Br').split(' ');
    let dt_modificacao =
      data_ajustada![0].split('/').reverse().join('-') +
      ' ' +
      data_ajustada![1];

    this.novoApontamento = {
      NR_REDUZIDOOP: this.prevOP.NR_REDUZIDOOP!,
      CD_LOCAL: this.prevOP.cd_local,
      DT_PREVRETORNO: this.prevOP.previsao,
      QT_OP: this.prevOP.qnt!,
      Status: this.prevOP.status!,
      CD_APONTAMENTO_DS:
        ApontamentoListParado[
          novoApontamentoForm as keyof typeof ApontamentoListParado
        ] + 1,
      DS_APONTAMENTO_DS: novoApontamentoForm,
      CD_USUARIO: this.cd_user,
      USUARIO: this.user,
      DT_MODIFICACAO: dt_modificacao,
      GEOLOCALIZACAO: this.latitude + ', ' + this.longitude,
    };

    console.log(this.novoApontamento);

    if (novoApontamentoForm.match('Parado') && this.selectedParado < 0) {
      this.err = true;
      this.loading = false;
    }

    if (novoApontamentoForm && !this.err) {
      this.loading = true;
      this._apontamentoService.setApontamento(this.novoApontamento).subscribe({
        next: (ret: any) => {
          this.dialogRef.close({
            removed: this.removed,
            DS_APONTAMENTO_DS: this.novoApontamento.DS_APONTAMENTO_DS,
          });
        },
        error: (err: { code: any; message: any }) => {
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

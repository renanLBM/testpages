import { Injectable } from '@angular/core';

import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

import { OP } from '../models/ops';
import { LogApontamento } from '../models/logApontamento';
import { LogAtraso } from '../models/logAtraso';

const MILISSECONDS_IN_3_HOURS = 10800000;

const LOG_ATRASO = [
  { header: 'CICLO_OP_REF', key: 'cod', width: 17 },
  { header: 'CD_LOCAL', key: 'CD_LOCAL', width: 10 },
  { header: 'LOCAL', key: 'DS_LOCAL', width: 44 },
  { header: 'DT_ANTERIOR', key: 'dtOriginal', width: 13 },
  { header: 'MOTIVO_ANTERIOR', key: 'motivoAnterior', width: 30 },
  { header: 'NOVA_PREVISAO', key: 'novaPrevisao', width: 16 },
  { header: 'NOVO_MOTIVO', key: 'novoMotivo', width: 30 },
  { header: 'USUARIO', key: 'usuario', width: 16 },
  { header: 'DT_INSERIDO', key: 'dtInserido', width: 12 },
];

const LOG_APONTAMENTO = [
  { header: 'CICLO_OP_REF', key: 'cod', width: 17 },
  { header: 'CD_LOCAL', key: 'CD_LOCAL', width: 10 },
  { header: 'LOCAL', key: 'DS_LOCAL', width: 44 },
  { header: 'APONTAMENTO_ANTERIOR', key: 'apontamentoAnterior', width: 31 },
  { header: 'APONTAMENTO_NOVO', key: 'apontamentoNovo', width: 31 },
  { header: 'USUARIO', key: 'usuario', width: 16 },
  { header: 'DT_INSERIDO', key: 'dtInserido', width: 12 },
];

const LISTA_OPS = [
  { header: 'Cód', key: 'cod', width: 17 },
  { header: 'Cód. Local', key: 'CD_LOCAL', width: 10 },
  { header: 'Local', key: 'DS_LOCAL', width: 45 },
  { header: 'Tipo', key: 'DS_TIPO', width: 12 },
  { header: 'Coordenado', key: 'DS_COORDENADO', width: 38 },
  { header: 'Peças', key: 'QT_OP', width: 6 },
  { header: 'Previsão Retorno', key: 'DT_PREVRETORNO', width: 16 },
  { header: 'Dias na Facção', key: 'dias_faccao', width: 13 },
  { header: 'Apontamento', key: 'DS_APONTAMENTO_DS', width: 33 },
  { header: 'Motivo Alteração', key: 'motivo_atraso', width: 30 },
  { header: 'Nova Previsão', key: 'nova_previsao', width: 13 },
  { header: 'Origem', key: 'DS_CLASS', width: 40 },
  { header: 'Coleção', key: 'colecao', width: 43 },
];

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  constructor() {}

  exportExcel(dados: any[], nomeArquivo: string) {
    const headers: string[] = [];

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(nomeArquivo);

    switch (nomeArquivo) {
      case 'log_data_retorno':
        LOG_ATRASO.forEach((_) => {
          headers.push(_.key);
        });
        worksheet.columns = LOG_ATRASO;

        dados.forEach((item: LogAtraso) => {
          worksheet.addRow(
            {
              cod: item.NR_CICLO + '-' + item.NR_OP + '-' + item.CD_REFERENCIA,
              CD_LOCAL: item[headers[1] as keyof LogAtraso],
              DS_LOCAL: item[headers[2] as keyof LogAtraso],
              dtOriginal: this.convertDate(item[headers[3] as keyof LogAtraso]!),
              motivoAnterior: item[headers[4] as keyof LogAtraso],
              novaPrevisao: this.convertDate(item[headers[5] as keyof LogAtraso]!),
              novoMotivo: item[headers[6] as keyof LogAtraso],
              usuario: item[headers[7] as keyof LogAtraso],
              dtInserido: this.convertDate(item[headers[8] as keyof LogAtraso]!),
            },
            'n'
          );
        });
        break;

      case 'log_apontamentos':
        LOG_APONTAMENTO.forEach((_) => {
          headers.push(_.key);
        });
        worksheet.columns = LOG_APONTAMENTO;

        dados.forEach((item: LogApontamento) => {
          worksheet.addRow(
            {
              cod: item.NR_CICLO + '-' + item.NR_OP + '-' + item.CD_REFERENCIA,
              CD_LOCAL: item[headers[1] as keyof LogApontamento],
              DS_LOCAL: item[headers[2] as keyof LogApontamento],
              apontamentoAnterior: item[headers[3] as keyof LogApontamento],
              apontamentoNovo: item[headers[4] as keyof LogApontamento],
              usuario: item[headers[5] as keyof LogApontamento],
              dtInserido: this.convertDate(
                item[headers[6] as keyof LogApontamento]!
              ),
            },
            'n'
          );
        });
        break;

      case 'faccontrol_ops':
        LISTA_OPS.forEach((_) => {
          headers.push(_.key);
        });
        worksheet.columns = LISTA_OPS;

        dados.forEach((item: OP) => {
          worksheet.addRow(
            {
              cod: item.NR_CICLO + '-' + item.NR_OP + '-' + item.CD_REFERENCIA,
              CD_LOCAL: item[headers[1] as keyof OP],
              DS_LOCAL: item[headers[2] as keyof OP],
              DS_TIPO: item[headers[3] as keyof OP],
              DS_COORDENADO: item[headers[4] as keyof OP],
              QT_OP: item[headers[5] as keyof OP],
              DT_PREVRETORNO: this.convertDate(item[headers[6] as keyof OP]!),
              dias_faccao: item[headers[7] as keyof OP],
              DS_APONTAMENTO_DS: item[headers[8] as keyof OP],
              motivo_atraso: item[headers[9] as keyof OP],
              nova_previsao: item[headers[10] as keyof OP],
              DS_CLASS: item[headers[11] as keyof OP],
              colecao: item.NR_CICLO + '-' + item.DS_CICLO,
            },
            'n'
          );
        });
        break;

      default:
        break;
    }

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, nomeArquivo + '.xlsx');
    });
  }

  convertDate(inputDate: string | number): string {
    if (inputDate === '-') {
      return '-';
    }
    const dia = new Date(+inputDate + MILISSECONDS_IN_3_HOURS).getDate();
    const mes = new Date(+inputDate + MILISSECONDS_IN_3_HOURS).getMonth() + 1; // take care of the month's number here ⚠️
    const ano = new Date(+inputDate + MILISSECONDS_IN_3_HOURS).getFullYear();

    return ('00'+dia).slice(-2) + '/' + ('00'+mes).slice(-2) + '/' + ano;
  }
}

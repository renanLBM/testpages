import { NbComponentStatus } from "@nebular/theme";

export interface OP {
  NR_CICLO: number,
  NR_OP: number,
  DS_MARCA: string,
  CD_REFERENCIA: number,
  DS_GRUPO: string,
  DS_CLASS: string,
  DS_TIPO: string,
  DS_COLECAO: string,
  CD_DROP: number,
  DS_DROP: string,
  CD_LOCAL: number,
  DS_LOCAL: string,
  DT_ENTRADA: number,
  PREV_RETORNO: Date,
  QT_OP: number,
  Status: string
}

export type OPs = Array<OP>;

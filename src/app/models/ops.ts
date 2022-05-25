import { NbComponentStatus } from "@nebular/theme";

export interface OP {
  cod?: string,
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
  CATEGORIA: string,
  DS_COORDENADO: string,
  CD_LOCAL: number,
  DS_LOCAL: string,
  DT_ENTRADA: string,
  PREV_RETORNO: string,
  QT_OP: number,
  semana?: string,
  Status: string,
  dias_faccao?: number,
  motivo_atraso?: string,
  nova_previsao?: string,
  Situacao?: string,
  css_class?: string
}

export type OPs = Array<OP>;

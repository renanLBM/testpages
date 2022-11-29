export interface Coleta {
  ID_COLETA?: number,
  ajustado?: string,

  NR_REDUZIDOOP: number,
  CD_LOCAL: number,
  QT_OP: number,
  DT_PREVRETORNO_HIST: string,
  DS_STATUS_HIST?: string,
  CD_RESPONSAVEL: number,
  DT_COLETA: string,
  GEOLOCALIZACAO?: string

  USUARIO?: string,
}

export type Coletas = Array<Coleta>;

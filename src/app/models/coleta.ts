export interface Coleta {
  ID_NOVA_SITUACAO?: number,
  CD_LOCAL: number,
  NR_CICLO: number,
  NR_OP: number,
  CD_REFERENCIA: string,
  DT_PREVRETORNO: string,
  QT_OP: number,
  Status: string,
  USUARIO: string,
  DT_COLETA: string,
  ajustado?: string,
  cod: string,
  latitude?: number,
  longitude?: number,
}

export type Coletas = Array<Coleta>;

export interface Apontamento {
  ID_NOVA_SITUACAO?: number,
  CD_LOCAL: number,
  NR_CICLO: number,
  NR_OP: number,
  CD_REFERENCIA: number,
  PREV_RETORNO: string,
  QT_OP: number,
  Status: string,
  Situacao?: string,
  USUARIO: string,
  DT_INSERIDO: string,
  cod: string,
  latitude?: number,
  longitude?: number,
}

export type Apontamentos = Array<Apontamento>;

export interface Motivo {
  NR_CICLO: number,
  NR_OP: number,
  CD_REFERENCIA: number,
  PREV_RETORNO: string,
  QT_OP: number,
  Status: string,
  NOVA_PREVISAO: string,
  MOTIVO: string,
  USUARIO: string,
  DT_INSERIDO: string
}

export type Motivos = Array<Motivo>;

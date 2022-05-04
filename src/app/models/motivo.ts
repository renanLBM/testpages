export interface Motivo {
  ID_NOVO_MOTIVO?: number,
  CD_LOCAL: number,
  NR_CICLO: number,
  NR_OP: number,
  CD_REFERENCIA: number,
  PREV_RETORNO: string,
  QT_OP: number,
  Status: string,
  NOVA_PREVISAO: string,
  MOTIVO: string,
  USUARIO: string,
  DT_INSERIDO: string,
  latitude?: number,
  longitude?: number,
}

export type Motivos = Array<Motivo>;

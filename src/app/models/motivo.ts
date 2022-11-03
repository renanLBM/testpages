export interface Motivo {
  ID_NOVO_MOTIVO?: number,
  CD_LOCAL: number,
  NR_CICLO: number,
  NR_OP: number,
  CD_REFERENCIA: number,
  DT_PREV_RETORNO_HIST: string,
  DT_PREV_RETORNO_NOVA: number,
  QT_OP: number,
  Status: string,
  Situacao?: string,
  NOVA_PREVISAO: string,
  MOTIVO: string,
  USUARIO: string,
  DT_INSERIDO: string,
  Status_Atual?: string,
  cod: string,
  latitude?: number,
  longitude?: number,
  Valida?: string
  ajustado?: string
}

export type Motivos = Array<Motivo>;

export interface Motivo {
  cod?: string,
  NR_CICLO?: number,
  NR_OP?: number,
  CD_REFERENCIA?: string,

  ID_NOVO_MOTIVO?: number,
  CD_LOCAL: number,
  DT_PREV_RETORNO: string,
  DT_PREV_RETORNO_NOVA: string,
  QT_OP: number,
  Status: string,
  Situacao?: string,
  NOVA_PREVISAO: string,
  CD_ATRASO_DS: number,
  DS_ATRASO_DS: string,
  DS_USUARIO?: string,
  CD_USUARIO: number,
  DT_INSERIDO: string,
  Status_Atual?: string,
  latitude?: number,
  longitude?: number,
  Valida?: string,
  ajustado?: string,

  DT_PREVRETORNO?: number,
  DS_APONTAMENTO_DS?: string,
  NR_REDUZIDOOP?: number,
  DT_MODIFICACAO?: string,
  CD_ATRASO?: number,
  CD_PRODUCAO?: string,
  GEOLOCALIZACAO?: string
}

export type Motivos = Array<Motivo>;

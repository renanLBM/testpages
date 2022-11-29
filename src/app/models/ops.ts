export interface OP {
  NR_CICLO: number,
  NR_OP: number,
  DS_MARCA: string,
  CD_REFERENCIA: string,
  DS_GRUPO: string,
  DS_CLASS: string,
  DS_TIPO: string,
  DS_COLECAO: string,
  CD_DROP: number,
  DS_DROP: string,
  DS_CICLO: string,
  CATEGORIA: string,
  DS_CATEGORIA?: string,
  DS_COORDENADO: string,
  CD_LOCAL: number,
  DS_LOCAL: string,
  DT_ENTRADA: string,
  DT_PREVRETORNO: number,
  QT_OP: number,
  Status: string,

  CD_PRODUCAO: string,
  NR_REDUZIDOOP?: number,
  DS_APONTAMENTO_DS?: string
  qnt?: number,
  pecas?: number,
  dt_ajustada?: Date,

  cod?: string,
  semana?: string,
  dias_faccao?: number,
  motivo_atraso?: string,
  nova_previsao?: string,
  Situacao?: string,
  css_class?: string,
}

export type OPs = Array<OP>;

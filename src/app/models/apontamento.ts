export interface Apontamento {
  ID_NOVA_SITUACAO?: number,
  CD_LOCAL: number,
  NR_CICLO?: number,
  NR_OP?: number,
  CD_REFERENCIA?: string,
  DT_PREVRETORNO: string | null,
  QT_OP: number,
  Status: string,
  Situacao?: string,
  USUARIO: string,
  DT_MODIFICACAO: string,
  latitude?: number,
  longitude?: number,
  cod?: string,

  CD_APONTAMENTO_DS?: number,
  DS_APONTAMENTO_DS?: string,
  NR_REDUZIDOOP?: number,
  CD_USUARIO?: number,
  GEOLOCALIZACAO?: string
}

export type Apontamentos = Array<Apontamento>;

export interface ApontamentoResumido {
  DS_CLASS: string,
  NR_CICLO: number,
  DS_APONTAMENTO_DS: string,
  sum: number,
  count: number,
}

export type ApontamentosResumidos = Array<ApontamentoResumido>;

export interface ApontamentoTotal {
  DS_APONTAMENTO_DS: string,
  cor: string,
  qnt: number,
  pecas: number,
}

export type ApontamentosTotal = Array<ApontamentoTotal>;

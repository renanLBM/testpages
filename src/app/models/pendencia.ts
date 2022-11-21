export interface Pendencia {
  CD_LOCAL?: number;
  DS_LOCAL?: number;
  CD_PENDENCIA?: number;
  NR_CICLO: number;
  NR_OP: number;
  CD_REFERENCIA: number;
  DS_CLASSIFICACAO: string;
  CD_PRODUTO_MP: number;
  DS_PRODUTO_MP: string;
  TAMANHO: string;
  QT_SOLICITADO: number;
  USUARIO: string;
  DT_SOLICITACAO: string;
  DS_STATUS_PENDENCIA: string;
  Obs?: string;
  CD_NovoStatus?: number;
  DS_NovoStatus?: string;
  MODIFICADO_POR?: string;
  DT_MODIFICACAO?: string;
  alterado?: boolean;
  cod?: string;
  CORTE?: string;
  QT_OP?: number;
  QT_OP_HIST?: number;
  MOTIVO?: string;
}

export type Pendencias = Array<Pendencia>;

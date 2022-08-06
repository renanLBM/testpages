export interface Pendencia {
  CD_PENDENCIA?: number;
  NR_CICLO: number;
  NR_OP: number;
  CD_REFERENCIA: number;
  DS_CLASSIFICACAO: string;
  CD_PRODUTO_MP: number;
  DS_PRODUTO_MP: string;
  QT_CONSUMOUNIT: string;
  QT_SOLICITADO: number;
  USUARIO: string;
  DT_SOLICITACAO: string;
  STATUS: string;
  Obs?: string;
}

export type Pendencias = Array<Pendencia>;

export interface LogApontamento {
  apontamentoAnterior: string;
  apontamentoNovo: string;
  diasNoApontamento: string;
  usuario: string;
  dtInserido: string;
  CD_LOCAL?: string;
  DS_LOCAL?: string;
  NR_CICLO?: string;
  NR_OP?: string;
  CD_REFERENCIA?: string;
}

export type LogApontamentos = Array<LogApontamento>;

export interface LogApontamento {
  'apontamentoAnterior': string,
	'apontamentoNovo': string,
  'diasNoApontamento': string,
	'usuario': string,
	'dtInserido': string
}

export type LogApontamentos = Array<LogApontamento>;

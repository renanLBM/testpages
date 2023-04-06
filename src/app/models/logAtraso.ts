export interface LogAtraso {
  dtOriginal: string;
  motivoAnterior: string;
  novaPrevisao: string;
  novoMotivo: string;
  usuario: string;
  dtInserido: string;
  CD_LOCAL?: string;
  DS_LOCAL?: string;
  NR_CICLO?: string;
  NR_OP?: string;
  CD_REFERENCIA?: string;
}

export type LogAtrasos = Array<LogAtraso>;

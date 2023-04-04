export interface LogAtraso {
  dtOriginal: string,
  motivoAnterior: string,
  novaPrevisao: string,
  novoMotivo: string,
  usuario: string,
  dtInserido: string
}

export type LogAtrasos = Array<LogAtraso>;

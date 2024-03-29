export interface OPDescricao {
  id?: number,
  name: string,
  qnt: number,
  qnt_atraso?: number,
  per_atraso?: number,
  qnt_pecas: number,
  pecas_atraso?: number,
  alteracoes?: number,
  status?: string,
  tipo?: string,
  origem?: string,
  ciclo?: string,
  colecao?: string,
  color?: string,
  ordem?: number
}

export type OPDescricoes = Array<OPDescricao>;

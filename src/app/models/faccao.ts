import { NbComponentStatus } from "@nebular/theme";

export interface Faccao {
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
  colecao?: string,
  color?: string,
}

export type Faccoes = Array<Faccao>;

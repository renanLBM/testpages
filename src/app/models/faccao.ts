import { NbComponentStatus } from "@nebular/theme";

export interface Faccao {
  id?: number,
  name: string,
  qnt: number,
  qnt_atraso?: string,
  per_atraso?: number,
  qnt_pecas?: string,
  status?: string,
  pecas_atraso?: string,
  tipos?: string,
  qnt_pecas_tipo?: string,
  tipo?: string,
  color?: string,
  alteracoes?: number,
}

export type Faccoes = Array<Faccao>;

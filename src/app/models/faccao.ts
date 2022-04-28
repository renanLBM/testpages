import { NbComponentStatus } from "@nebular/theme";

export interface Faccao {
  id?: number,
  name: string,
  qnt: number,
  qnt_atraso?: string,
  per_atraso?: number,
  qnt_pecas?: string,
  color?: string,
  alteracoes?: number,
}

export type Faccoes = Array<Faccao>;

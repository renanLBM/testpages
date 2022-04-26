import { NbComponentStatus } from "@nebular/theme";

export interface Faccao {
  id?: number,
  name: string,
  qnt: number,
  qnt_atraso?: number,
  qnt_pecas?: number,
  color?: string,
  alteracoes?: number,
}

export type Faccoes = Array<Faccao>;

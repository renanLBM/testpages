import { NbComponentStatus } from "@nebular/theme";

export interface Faccao {
  id?: number,
  name: string,
  qnt: number,
  qnt_atraso?: number,
  color?: string,
}

export type Faccoes = Array<Faccao>;

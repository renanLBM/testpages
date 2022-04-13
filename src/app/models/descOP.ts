import { NbComponentStatus } from "@nebular/theme";

export interface descOP {
  cod: string,
  ciclo?: number,
  op?: number,
  ref: number,
  previsao: string,
  descricao?: string,
  drop?: string,
  novaprevisao: string,
  checked: boolean,
  img?: string,
  status?: string,
  status_color?: string,
  accent?: NbComponentStatus,
  qnt?: number,
}

export type descOPs = Array<descOP>;

import { NbComponentStatus } from "@nebular/theme";

export interface descOP {
  local: string,
  cod: string,
  ciclo?: number,
  op?: number,
  ref: number,
  previsao: string,
  descricao?: string,
  drop?: string,
  novaprevisao: string,
  motivo_atraso: string,
  checked: boolean,
  img?: string,
  status?: string,
  status_color?: string,
  accent?: NbComponentStatus,
  qnt?: number,
}

export type descOPs = Array<descOP>;

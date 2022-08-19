import { NbComponentStatus } from "@nebular/theme";

export interface descOP {
  cd_local: number,
  local: string,
  cod: string,
  ciclo?: number,
  op?: number,
  ref: number,
  previsao: string,
  entrada?: string,
  semana?: number,
  descricao?: string,
  drop?: string,
  novaprevisao?: string,
  motivo_atraso?: string,
  checked: boolean,
  img?: string,
  link_ficha_tecnica: string,
  status?: string,
  Situacao?: string,
  status_color?: string,
  accent?: NbComponentStatus,
  qnt?: number,
}

export type descOPs = Array<descOP>;

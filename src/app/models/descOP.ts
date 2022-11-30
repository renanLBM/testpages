import { NbComponentStatus } from "@nebular/theme";

export interface descOP {
  cod?: string,
  cd_local: number,
  local: string,
  ciclo?: number,
  op?: number,
  ref: string,
  previsao: string | null,
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

  DS_APONTAMENTO_DS?: string,
  NR_REDUZIDOOP: number,
  CD_ATRASO?: number
}

export type descOPs = Array<descOP>;

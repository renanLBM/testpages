export interface descOP {
  cod: string,
  ref: string,
  previsao: string,
  novaprevisao: string,
  checked: boolean,
  status?: string,
  qnt?: number,
}

export type descOPs = Array<descOP>;

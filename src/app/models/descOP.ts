export interface descOP {
  cod: string,
  ref: string,
  previsao: string,
  novaprevisao: string,
  checked: boolean,
  img?: string,
  status?: string,
  qnt?: number,
}

export type descOPs = Array<descOP>;

import { Pendencias } from "./pendencia";

export interface LocalFaccao {
  CD_LOCAL: string,
  DS_LOCAL: string,
  REGIAO: string
}

export type LocalFaccoes = Array<LocalFaccao>;


export interface PendenciaLocal {
  local: string;
  pendencias: Pendencias;
}

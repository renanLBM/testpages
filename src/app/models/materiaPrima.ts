export interface MateriaPrima {
  NR_CICLO: number;
  NR_OP: number;
  CD_REFERENCIA: number;
  CD_TIPOCLAS: number;
  DS_CLASSIFICACAO: string;
  mp_list: Array<MateriaPrimaList>;
}

export type MateriasPrimas = Array<MateriaPrima>;

export interface MateriaPrimaList {
  tipo?: string;
  CD_PRODUTO_MP: number;
  DS_PRODUTO_MP: string;
  DS_TAMANHO?: Array<string>;
  TAMANHO_SELECIONADO?: number;
}

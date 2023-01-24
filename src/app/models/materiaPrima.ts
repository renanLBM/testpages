export interface MateriaPrima {
  NR_CICLO: number;
  NR_OP: number;
  CD_REFERENCIA: number;
  CD_TIPOCLAS: number;
  DS_PRODUCT_CLASSIFICATION: string;
  mp_list: Array<MateriaPrimaList>;
}

export type MateriasPrimas = Array<MateriaPrima>;

export interface MateriaPrimaList {
  tipo?: string;
  CD_MATERIAL: number;
  DS_MATERIAL: string;
  DS_MATERIAL_SIZE: string;
  DS_TAMANHO?: Array<string>;
  TAMANHO_SELECIONADO?: number;
}

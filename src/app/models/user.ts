export interface User {
  id?: number,
  nome: string,
  nivel: number,
  login?: string,
  senha?: string,
}

// cria um array de User para não precisar criar em cada component
export type Users = Array<User>;

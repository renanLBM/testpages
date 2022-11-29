export interface User {
  CD_USUARIO?: number,
  id?: number,
  nome?: string,
  nivel?: number,
  regiao?: string,
  login?: string,
  senha?: string,
  uid?: string,
  email?: string,
  displayName?: string,
  role?: string,
  active?: string,
}

// cria um array de User para não precisar criar em cada component
export type Users = Array<User>;

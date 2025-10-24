export type Role = 'turista' | 'vlasnik' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: Role;
  name?: string;
  lastname?: string;
  image?: string;
}
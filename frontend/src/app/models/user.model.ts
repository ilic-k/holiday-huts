export type Role = 'turista' | 'vlasnik' | 'admin';

export class User {
  _id = '';
  username = '';
  email = '';
  role: Role = 'turista';
  name = '';
  lastname = '';
  image = '';
}

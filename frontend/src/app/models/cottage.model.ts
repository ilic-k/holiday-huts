import { User } from "./user.model";

export class Cottage {
  _id = '';
  title = '';
  place = '';
  images: string[] = [];
  pricing = { summer: 0, winter: 0 };
  ratingAvg = 0;
  ratingCount = 0;
  blockedUntil = '';
  owner: User | null = null;
}

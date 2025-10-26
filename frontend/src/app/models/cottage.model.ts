import { User } from "./user.model";

export class Cottage {
  _id = '';
  title = '';
  place = '';
  services = '';
  phone = '';
  images: string[] = [];
  pricing = { summer: 0, winter: 0 };
  coords = { lat: 0, lng: 0 };
  ratingAvg = 0;
  ratingCount = 0;
  blockedUntil = '';
  owner: User | null = null;
}

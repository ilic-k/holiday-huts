export class Cottage {
  _id: string;
  title: string;
  place: string;
  images: string[];
  pricing?: { summer: number; winter: number };
  ratingAvg?: number;
  ratingCount?: number;
  blockedUntil?: string; // ISO string iz BE
  owner?: { _id: string; username: string; email: string };
}
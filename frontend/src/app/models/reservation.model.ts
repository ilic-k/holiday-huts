import { Cottage } from "./cottage.model";
import { User } from "./user.model";

export type ReservationStatus = 'pending'|'approved'|'rejected'|'cancelled'|'finished';

export class Reservation {
  _id = '';
  cottage: Cottage | undefined = undefined;
  tourist: User | undefined = undefined;
  startDate = '';
  endDate = '';
  adults = 1;
  children = 0;
  priceTotal = 0;
  status: ReservationStatus = 'pending';
  rating: number | null = null;
  comment: string | null = null;
}

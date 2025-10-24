export type ReservationStatus = 'pending'|'approved'|'rejected'|'cancelled'|'finished';

export interface Reservation {
  _id: string;
  cottage: string | Cottage;
  tourist: string | User;
  startDate: string; // ISO
  endDate: string;   // ISO
  adults: number;
  children: number;
  priceTotal: number;
  status: ReservationStatus;
  rating?: number | null;
  comment?: string | null;
}
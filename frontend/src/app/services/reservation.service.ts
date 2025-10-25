import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  http = inject(HttpClient);

  create(body: any) {
    return this.http.post(`${environment.apiBaseUrl}/reservations`, body);
  }

  getMine(touristId: string) {
    return this.http.get(`${environment.apiBaseUrl}/reservations/mine/${touristId}`);
  }

  approve(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/reservations/${id}/approve`, {});
  }

  reject(id: string, reason?: string) {
    return this.http.patch(`${environment.apiBaseUrl}/reservations/${id}/reject`, { reason });
  }

  cancel(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/reservations/${id}/cancel`, {});
  }

  leaveReview(id: string, body: { rating: number; comment: string }) {
    return this.http.patch(`${environment.apiBaseUrl}/reservations/${id}/review`, body);
  }
}

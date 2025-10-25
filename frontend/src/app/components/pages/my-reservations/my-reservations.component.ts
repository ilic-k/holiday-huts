import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.css'
})
export class MyReservationsComponent {
  reservationService = inject(ReservationService);
  auth = inject(AuthService);

  reservations: any[] = [];
  reviewingId: string | null = null;
  reviewRating = 5;
  reviewComment = '';

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.reservationService.getMine(user._id).subscribe({
      next: (res: any) => {
        this.reservations = res?.data ?? [];
      },
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  canCancel(reservation: any): boolean {
    if (!reservation.startDate) return false;
    const start = new Date(reservation.startDate);
    const now = new Date();
    const hoursDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return (
      (reservation.status === 'pending' || reservation.status === 'approved') &&
      start > now &&
      hoursDiff >= 24
    );
  }

  canReview(reservation: any): boolean {
    if (!reservation.endDate) return false;
    const end = new Date(reservation.endDate);
    const now = new Date();
    
    return (
      (reservation.status === 'approved' || reservation.status === 'finished') &&
      end < now &&
      !reservation.rating &&
      !reservation.comment
    );
  }

  cancelReservation(id: string) {
    if (!confirm('Da li ste sigurni da želite da otkažete rezervaciju?')) return;

    this.reservationService.cancel(id).subscribe({
      next: (res: any) => {
        const idx = this.reservations.findIndex(r => r._id === id);
        if (idx >= 0) {
          this.reservations[idx] = res.reservation;
        }
        alert('Rezervacija je otkazana!');
      },
      error: (err) => alert(err?.error?.message || 'Greška pri otkazivanju')
    });
  }

  startReview(id: string) {
    this.reviewingId = id;
    this.reviewRating = 5;
    this.reviewComment = '';
  }

  cancelReview() {
    this.reviewingId = null;
  }

  submitReview() {
    if (!this.reviewingId) return;

    const user = this.auth.getCurrentUser();
    if (!user) return;

    const body = {
      rating: this.reviewRating,
      comment: this.reviewComment,
      touristId: user._id
    };

    this.reservationService.leaveReview(this.reviewingId, body).subscribe({
      next: (res: any) => {
        const idx = this.reservations.findIndex(r => r._id === this.reviewingId);
        if (idx >= 0) {
          this.reservations[idx] = res.reservation;
        }
        alert('Hvala na oceni!');
        this.reviewingId = null;
      },
      error: (err) => alert(err?.error?.message || 'Greška pri ostavljanju ocene')
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: any = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger',
      cancelled: 'bg-secondary',
      finished: 'bg-info'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      pending: 'Na čekanju',
      approved: 'Odobreno',
      rejected: 'Odbijeno',
      cancelled: 'Otkazano',
      finished: 'Završeno'
    };
    return map[status] || status;
  }
}

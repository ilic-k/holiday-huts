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

  allReservations: any[] = [];
  reviewingId: string | null = null;
  reviewRating = 5;
  reviewComment = '';

  // Filtrirane liste
  get currentReservations() {
    const now = new Date();
    return this.allReservations.filter(r => {
      const end = new Date(r.endDate);
      return end >= now && (r.status === 'pending' || r.status === 'approved');
    });
  }

  get pastReservations() {
    const now = new Date();
    return this.allReservations
      .filter(r => {
        const end = new Date(r.endDate);
        return end < now || r.status === 'completed' || r.status === 'finished' || r.status === 'cancelled' || r.status === 'rejected';
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.reservationService.getMine(user._id).subscribe({
      next: (res: any) => {
        this.allReservations = res?.data ?? [];
      },
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  // Može otkazati ako je 1 dan ili više pre početka
  canCancel(reservation: any): boolean {
    if (!reservation.startDate) return false;
    const start = new Date(reservation.startDate);
    const now = new Date();
    const daysDiff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    return (
      (reservation.status === 'pending' || reservation.status === 'approved') &&
      daysDiff >= 1
    );
  }

  // Može ostaviti ocenu samo za završene rezervacije koje nemaju ocenu/komentar
  canReview(reservation: any): boolean {
    if (!reservation.endDate) return false;
    const end = new Date(reservation.endDate);
    const now = new Date();
    
    return (
      (reservation.status === 'completed' || reservation.status === 'finished') &&
      end < now &&
      !reservation.rating &&
      !reservation.comment
    );
  }

  cancelReservation(id: string) {
    if (!confirm('Da li ste sigurni da želite da otkažete rezervaciju?')) return;

    this.reservationService.cancel(id).subscribe({
      next: (res: any) => {
        const idx = this.allReservations.findIndex(r => r._id === id);
        if (idx >= 0) {
          this.allReservations[idx] = res.reservation;
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
        const idx = this.allReservations.findIndex(r => r._id === this.reviewingId);
        if (idx >= 0) {
          this.allReservations[idx] = res.reservation;
        }
        alert('Hvala na oceni!');
        this.reviewingId = null;
      },
      error: (err) => alert(err?.error?.message || 'Greška pri ostavljanju ocene')
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getStatusText(status: string): string {
    const map: any = {
      pending: 'Na čekanju',
      approved: 'Odobreno',
      rejected: 'Odbijeno',
      cancelled: 'Otkazano',
      completed: 'Završeno',
      finished: 'Ocenjeno'
    };
    return map[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const map: any = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger',
      cancelled: 'bg-secondary',
      completed: 'bg-info',
      finished: 'bg-primary'
    };
    return map[status] || 'bg-secondary';
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './owner-reservations.component.html',
  styleUrl: './owner-reservations.component.css'
})
export class OwnerReservationsComponent {
  reservationService = inject(ReservationService);
  auth = inject(AuthService);

  allReservations: any[] = [];
  rejectingId: string | null = null;
  rejectNote = '';

  // Filtrirane liste - samo pending rezervacije
  get pendingReservations() {
    return this.allReservations
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.loadReservations(user._id);
  }

  loadReservations(ownerId: string) {
    this.reservationService.getForOwner(ownerId).subscribe({
      next: (res: any) => {
        this.allReservations = res?.reservations ?? [];
      },
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  approveReservation(id: string) {
    if (!confirm('Da li ste sigurni da želite da odobrite ovu rezervaciju?')) return;

    this.reservationService.approve(id).subscribe({
      next: (res: any) => {
        const idx = this.allReservations.findIndex(r => r._id === id);
        if (idx >= 0) {
          this.allReservations[idx] = res.reservation;
        }
        alert('Rezervacija je odobrena!');
      },
      error: (err) => alert(err?.error?.message || 'Greška pri odobravanju')
    });
  }

  startReject(id: string) {
    this.rejectingId = id;
    this.rejectNote = '';
  }

  cancelReject() {
    this.rejectingId = null;
    this.rejectNote = '';
  }

  confirmReject() {
    if (!this.rejectingId) return;

    if (!this.rejectNote || this.rejectNote.trim().length === 0) {
      alert('Morate uneti razlog odbijanja!');
      return;
    }

    this.reservationService.reject(this.rejectingId, this.rejectNote.trim()).subscribe({
      next: (res: any) => {
        const idx = this.allReservations.findIndex(r => r._id === this.rejectingId);
        if (idx >= 0) {
          this.allReservations[idx] = res.reservation;
        }
        alert('Rezervacija je odbijena!');
        this.rejectingId = null;
        this.rejectNote = '';
      },
      error: (err) => {
        alert(err?.error?.message || 'Greška pri odbijanju');
      }
    });
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
}

import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CottageService } from '../../../services/cottage.service';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-cottage-details',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cottage-details.component.html'
})
export class CottageDetailsComponent {
  route = inject(ActivatedRoute);
  cottages = inject(CottageService);
  reservations = inject(ReservationService);
  auth = inject(AuthService);

  cottage: any;
  startDate = '';
  endDate = '';
  adults = 1;
  children = 0;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.cottages.getOne(id).subscribe({
      next: (res: any) => this.cottage = res?.cottage ?? res?.data ?? res
    });
  }

  reserve() {
    const u = this.auth.getCurrentUser();
    if (!u) { alert('Prijavi se'); return; }

    const body = {
      cottageId: this.cottage._id,
      touristId: u._id,
      startDate: this.startDate,
      endDate: this.endDate,
      adults: this.adults,
      children: this.children
    };

    this.reservations.create(body).subscribe({
      next: () => alert('Rezervacija poslata!'),
      error: (err) => alert(err?.error?.message || 'Greška pri rezervaciji')
    });
  }
}

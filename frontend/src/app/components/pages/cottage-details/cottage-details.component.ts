import { Component, inject, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { AuthService } from '../../../services/auth.service';
import { CottageService } from '../../../services/cottage.service';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'app-cottage-details',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './cottage-details.component.html'
})
export class CottageDetailsComponent implements AfterViewInit {
  route = inject(ActivatedRoute);
  cottages = inject(CottageService);
  reservations = inject(ReservationService);
  auth = inject(AuthService);

  cottage: any;
  comments: any[] = [];
  startDate = '';
  endDate = '';
  adults = 1;
  children = 0;
  selectedImage = 0;
  private map: L.Map | null = null;
  private mapReady = false;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.cottages.getOne(id).subscribe({
      next: (res: any) => {
        this.cottage = res?.cottage ?? res?.data ?? res;
        if (this.cottage?.images?.length > 0) {
          this.selectedImage = 0;
        }
        // Pokušaj inicijalizovati mapu ako je view spreman
        if (this.mapReady && this.cottage?.coords) {
          setTimeout(() => this.initMap(), 100);
        }
      }
    });
    
    this.cottages.getComments(id).subscribe({
      next: (res: any) => this.comments = res?.comments ?? []
    });
  }

  ngAfterViewInit() {
    this.mapReady = true;
    if (this.cottage?.coords) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  initMap() {
    if (!this.cottage?.coords?.lat || !this.cottage?.coords?.lng) return;
    
    const mapEl = document.getElementById('map');
    if (!mapEl || this.map) return;

    try {
      this.map = L.map('map', {
        center: [this.cottage.coords.lat, this.cottage.coords.lng],
        zoom: 13,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      const customIcon = L.icon({
        iconUrl: '/assets/leaflet/marker-icon.png',
        iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
        shadowUrl: '/assets/leaflet/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.marker([this.cottage.coords.lat, this.cottage.coords.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(`<b>${this.cottage.title}</b><br>${this.cottage.place}`)
        .openPopup();

      setTimeout(() => this.map?.invalidateSize(), 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  getStars(rating: number): string {
    if (!rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
  }

  selectImage(index: number) {
    this.selectedImage = index;
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

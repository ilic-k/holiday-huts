import { Component, inject, AfterViewInit, OnDestroy } from '@angular/core';
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
export class CottageDetailsComponent implements AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  cottages = inject(CottageService);
  reservations = inject(ReservationService);
  auth = inject(AuthService);

  cottage: any;
  comments: any[] = [];
  
  // Rezervacija - Step 1
  step = 1; // 1 = unos datuma, 2 = pregled i plaćanje
  startDate = '';
  endDate = '';
  adults = 1;
  children = 0;
  
  // Rezervacija - Step 2
  creditCard = '';
  description = '';
  totalPrice = 0;
  nights = 0;
  
  // UI
  selectedImage = 0;
  reservationMsg = '';
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

    // Popuni kreditnu karticu korisnika za Step 2
    const u = this.auth.getCurrentUser();
    if (u && (u as any).creditCard) {
      this.creditCard = (u as any).creditCard;
    }
  }

  ngAfterViewInit() {
    this.mapReady = true;
    if (this.cottage?.coords) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    // Očisti mapu da se spreči memory leak i omogući ponovno kreiranje
    if (this.map) {
      this.map.remove();
      this.map = null;
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

  // Prelazak na Step 2
  goToStep2() {
    this.reservationMsg = '';
    
    if (!this.startDate || !this.endDate) {
      this.reservationMsg = 'Molimo unesite datume početka i kraja.';
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    if (start >= end) {
      this.reservationMsg = 'Datum kraja mora biti posle datuma početka.';
      return;
    }

    if (start < new Date()) {
      this.reservationMsg = 'Datum početka ne može biti u prošlosti.';
      return;
    }

    // Izračunaj broj noćenja
    this.nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Izračunaj cenu (pretpostavljam letnju sezonu, možeš dodati logiku po mesecu)
    const pricePerNight = this.cottage?.pricing?.summer || this.cottage?.pricing?.winter || 0;
    this.totalPrice = this.nights * pricePerNight;

    this.step = 2;
  }

  // Povratak na Step 1
  backToStep1() {
    this.step = 1;
    this.reservationMsg = '';
  }

  // Finalna potvrda rezervacije
  confirmReservation() {
    this.reservationMsg = '';
    
    const u = this.auth.getCurrentUser();
    if (!u) { 
      this.reservationMsg = 'Morate biti prijavljeni.';
      return; 
    }

    if (!this.creditCard || this.creditCard.length < 15) {
      this.reservationMsg = 'Unesite validnu kreditnu karticu.';
      return;
    }

    if (this.description && this.description.length > 500) {
      this.reservationMsg = 'Opis ne može biti duži od 500 karaktera.';
      return;
    }

    const body = {
      cottageId: this.cottage._id,
      touristId: u._id,
      startDate: this.startDate,
      endDate: this.endDate,
      adults: this.adults,
      children: this.children,
      description: this.description?.trim() || '',
      creditCard: this.creditCard
    };

    this.reservations.create(body).subscribe({
      next: (res: any) => {
        this.reservationMsg = res?.message || 'Rezervacija je uspešno poslata!';
        // Reset forme nakon 3s
        setTimeout(() => {
          this.step = 1;
          this.startDate = '';
          this.endDate = '';
          this.adults = 1;
          this.children = 0;
          this.description = '';
          this.reservationMsg = '';
        }, 3000);
      },
      error: (err) => {
        this.reservationMsg = err?.error?.message || 'Greška pri rezervaciji. Vikendica možda nije dostupna u izabranom periodu.';
      }
    });
  }
}

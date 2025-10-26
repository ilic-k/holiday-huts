import { Component, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-cottages',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './admin-cottages.component.html',
  styleUrl: './admin-cottages.component.css'
})
export class AdminCottagesComponent {
  admin = inject(AdminService);

  cottages: any[] = [];
  filteredCottages: any[] = [];
  searchText = '';
  searchPlace = '';

  ngOnInit() {
    this.loadCottages();
  }

  loadCottages() {
    this.admin.getAllCottagesQuality().subscribe({
      next: (res: any) => {
        this.cottages = res?.data ?? res?.cottages ?? res ?? [];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading cottages:', err);
        alert('Greška pri učitavanju vikendica');
      }
    });
  }

  applyFilters() {
    this.filteredCottages = this.cottages.filter(c => {
      const matchesText = !this.searchText || 
        c.title?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesPlace = !this.searchPlace || 
        c.place?.toLowerCase().includes(this.searchPlace.toLowerCase());
      return matchesText && matchesPlace;
    });
  }

  blockCottage(cottage: any) {
    if (!confirm(`Da li ste sigurni da želite da blokirate vikendicu "${cottage.title}" na 48h?`)) {
      return;
    }

    this.admin.block48h(cottage._id).subscribe({
      next: (res: any) => {
        alert('Vikendica uspešno blokirana na 48 sati!');
        // Ažuriraj lokalno stanje
        cottage.isBlocked = true;
        cottage.blockedUntil = res?.cottage?.blockedUntil || new Date(Date.now() + 48 * 60 * 60 * 1000);
      },
      error: (err) => {
        alert(err?.error?.message || 'Greška pri blokiranju vikendice');
      }
    });
  }

  isBlocked(cottage: any): boolean {
    if (!cottage.blockedUntil) return false;
    return new Date(cottage.blockedUntil) > new Date();
  }

  shouldHighlight(cottage: any): boolean {
    return cottage.isLowRated === true || cottage.lowCount === 3;
  }
}

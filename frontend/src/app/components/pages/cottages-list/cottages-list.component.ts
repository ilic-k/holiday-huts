import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CottageService } from '../../../services/cottage.service';
import { AuthService } from '../../../services/auth.service';
import { Cottage } from '../../../models/cottage.model';

@Component({
  selector: 'app-cottages-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cottages-list.component.html'
})
export class CottagesListComponent {
  service = inject(CottageService);
  auth = inject(AuthService);
  cottages: Cottage[] = [];
  q = '';
  place = '';
  sort = '';

  // Statistika
  stats: any = null;
  loadingStats = true;

  ngOnInit() {
    this.loadStats();
    this.load();
  }

  loadStats() {
    this.service.getStats().subscribe({
      next: (res: any) => {
        this.stats = res?.stats ?? null;
        this.loadingStats = false;
      },
      error: err => {
        console.error(err);
        this.loadingStats = false;
      }
    });
  }

  load() {
    this.service.getAll(this.q, this.place, this.sort).subscribe({
      next: (res: any) => {
        // Backend returns { cottages: [...] }
        this.cottages = Array.isArray(res)
          ? res
          : (res?.cottages ?? res?.data ?? []);
      },
      error: err => console.error(err)
    });
  }

  sortBy(field: 'title' | 'place') {
    // Toggle sorting: '' → 'field' → '-field' → ''
    if (this.sort === field) {
      this.sort = `-${field}`;
    } else if (this.sort === `-${field}`) {
      this.sort = '';
    } else {
      this.sort = field;
    }
    this.load();
  }

  getSortIcon(field: string): string {
    if (this.sort === field) return '▲';
    if (this.sort === `-${field}`) return '▼';
    return '↕';
  }

  getStars(rating: number): string {
    if (!rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
  }
}

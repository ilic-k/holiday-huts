import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CottageService } from '../../../services/cottage.service';
import { Cottage } from '../../../models/cottage.model';

@Component({
  selector: 'app-cottages-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cottages-list.component.html'
})
export class CottagesListComponent {
  service = inject(CottageService);
  cottages: Cottage[] = [];
  q = '';
  place = '';

  ngOnInit() { this.load(); }

  load() {
    this.service.getAll(this.q, this.place).subscribe({
      next: (res: any) => {
        // Backend returns { cottages: [...] }
        this.cottages = Array.isArray(res)
          ? res
          : (res?.cottages ?? res?.data ?? []);
      },
      error: err => console.error(err)
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CottageService } from '../../../services/cottage.service';

@Component({
  selector: 'app-my-cottages',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-cottages.component.html',
  styleUrl: './my-cottages.component.css'
})
export class MyCottagesComponent {
  auth = inject(AuthService);
  cottages = inject(CottageService);

  cottageList: any[] = [];
  isFormVisible = false;
  isEditMode = false;
  currentCottageId: string | null = null;

  // Form fields
  title = '';
  place = '';
  summerPrice = 0;
  winterPrice = 0;
  services = '';
  phone = '';
  latitude = 0;
  longitude = 0;
  imageFiles: File[] = [];
  existingImages: string[] = [];

  ngOnInit() {
    this.loadCottages();
  }

  loadCottages() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.cottages.getMine(user._id).subscribe({
      next: (res: any) => {
        this.cottageList = res?.cottages ?? res?.data ?? res ?? [];
      },
      error: (err) => {
        console.error('Error loading cottages:', err);
        alert('Greška pri učitavanju vikendica');
      }
    });
  }

  showAddForm() {
    this.isFormVisible = true;
    this.isEditMode = false;
    this.resetForm();
  }

  showEditForm(cottage: any) {
    this.isFormVisible = true;
    this.isEditMode = true;
    this.currentCottageId = cottage._id;
    this.title = cottage.title;
    this.place = cottage.place;
    this.summerPrice = cottage.pricing?.summer ?? 0;
    this.winterPrice = cottage.pricing?.winter ?? 0;
    this.services = cottage.services ?? '';
    this.phone = cottage.phone ?? '';
    this.latitude = cottage.coords?.lat ?? 0;
    this.longitude = cottage.coords?.lng ?? 0;
    this.existingImages = cottage.images ?? [];
    this.imageFiles = [];
  }

  resetForm() {
    this.title = '';
    this.place = '';
    this.summerPrice = 0;
    this.winterPrice = 0;
    this.services = '';
    this.phone = '';
    this.latitude = 0;
    this.longitude = 0;
    this.imageFiles = [];
    this.existingImages = [];
    this.currentCottageId = null;
  }

  cancelForm() {
    this.isFormVisible = false;
    this.resetForm();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files);
    }
  }

  saveCottage() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      alert('Morate biti prijavljeni');
      return;
    }

    if (!this.title || !this.place) {
      alert('Naziv i mesto su obavezni');
      return;
    }

    // Koristi FormData za upload slika
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('place', this.place);
    formData.append('services', this.services || '');
    formData.append('phone', this.phone || '');
    formData.append('pricing[summer]', this.summerPrice.toString());
    formData.append('pricing[winter]', this.winterPrice.toString());
    formData.append('coords[lat]', this.latitude.toString());
    formData.append('coords[lng]', this.longitude.toString());
    formData.append('ownerId', user._id);

    // Dodaj slike
    this.imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (this.isEditMode && this.currentCottageId) {
      // Update existing cottage
      this.cottages.update(this.currentCottageId, formData).subscribe({
        next: () => {
          alert('Vikendica uspešno ažurirana!');
          this.cancelForm();
          this.loadCottages();
        },
        error: (err) => {
          alert(err?.error?.message || 'Greška pri ažuriranju vikendice');
        }
      });
    } else {
      // Create new cottage
      this.cottages.create(formData).subscribe({
        next: () => {
          alert('Vikendica uspešno dodata!');
          this.cancelForm();
          this.loadCottages();
        },
        error: (err) => {
          alert(err?.error?.message || 'Greška pri dodavanju vikendice');
        }
      });
    }
  }

  deleteCottage(id: string) {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu vikendicu?')) {
      return;
    }

    this.cottages.remove(id).subscribe({
      next: () => {
        alert('Vikendica uspešno obrisana!');
        this.loadCottages();
      },
      error: (err) => {
        if (err?.status === 400) {
          alert('Ne možete obrisati vikendicu koja ima buduće rezervacije!');
        } else {
          alert(err?.error?.message || 'Greška pri brisanju vikendice');
        }
      }
    });
  }
}

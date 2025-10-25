// src/app/components/profile/profile.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

const PASS_RE =
/^(?=.{6,10}$)(?=[A-Za-z])[A-Za-z](?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'] // opciono
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // prikaz / edit model
  user: User = new User();        // popunjava se iz BE
  loading = true;
  errorMsg = '';
  successMsg = '';

  // edit polja (kopija da ne diramo odmah user)
  name = '';
  lastname = '';
  gender: 'M' | 'Z' | '' = '';
  address = '';
  phone = '';
  email = '';
  creditCard = '';

  // upload slike (opciono)
  imageFile: File | null = null;
  imagePreview: string | null = null;

  // change-password
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  pwdMsg = '';

  ngOnInit() {
    const current = this.auth.getCurrentUser();
    if (!current) {
      this.router.navigateByUrl('/login');
      return;
    }
    // učitaj svež profil sa BE koristeći username
    this.auth.getProfile(current.username).subscribe({
      next: (res: any) => {
        // backend vraća { message, user }
        const u = Object.assign(new User(), res?.user ?? res?.data ?? res ?? {});
        this.user = u;
        // inicijalizuj formu
        this.name = u.name || '';
        this.lastname = u.lastname || '';
        this.gender = (u as any).gender || ''; // ako ga imaš u šemi
        this.address = (u as any).address || '';
        this.phone = (u as any).phone || '';
        this.email = u.email || '';
        this.creditCard = (u as any).creditCard || '';
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Greška pri učitavanju profila';
        this.loading = false;
      }
    });
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg = 'Fajl mora biti slika';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'Slika ne sme biti veća od 5MB';
      input.value = '';
      return;
    }
    this.imageFile = file;
    this.errorMsg = '';

    // preview (nije obavezno)
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.errorMsg = '';
    this.successMsg = '';

    const username = this.user.username;
    if (!username) return;

    // Ako menjaš sliku → FormData; u suprotnom JSON
    const hasImage = !!this.imageFile;
    let payload: any;

    if (hasImage) {
      const fd = new FormData();
      fd.append('email', this.email.trim().toLowerCase());
      if (this.name) fd.append('name', this.name.trim());
      if (this.lastname) fd.append('lastname', this.lastname.trim());
      if (this.gender) fd.append('gender', this.gender);
      if (this.address) fd.append('address', this.address.trim());
      if (this.phone) fd.append('phone', this.phone.trim());
      if (this.creditCard) fd.append('creditCard', this.creditCard.trim());
      fd.append('image', this.imageFile!); // ← naziv polja 'image'
      payload = fd;
    } else {
      payload = {
        email: this.email.trim().toLowerCase(),
        name: this.name?.trim(),
        lastname: this.lastname?.trim(),
        gender: this.gender || undefined,
        address: this.address?.trim(),
        phone: this.phone?.trim(),
        creditCard: this.creditCard?.trim()
      };
    }

    this.loading = true;
    this.auth.updateProfile(username, payload).subscribe({
      next: (res: any) => {
        this.successMsg = res?.message || 'Profil je uspešno ažuriran';
        // ako backend vrati novog usera, osveži lokalno stanje i header
        const updated = res?.user;
        if (updated) {
          const u = Object.assign(new User(), updated);
          this.user = u;
          this.auth.setUser(u);
        }
        this.loading = false;
        // reset image stanja
        this.imageFile = null;
        this.imagePreview = null;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Greška pri ažuriranju profila';
        this.loading = false;
      }
    });
  }

  changePassword() {
    this.pwdMsg = '';
    if (!this.oldPassword || !this.newPassword) {
      this.pwdMsg = 'Popunite staru i novu lozinku.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.pwdMsg = 'Nove lozinke se ne poklapaju.';
      return;
    }
    if (!PASS_RE.test(this.newPassword)) {
      this.pwdMsg = 'Nova lozinka nije u traženom formatu.';
      return;
    }

    const id = this.user._id;
    this.auth.changePassword({ userId: id, oldPassword: this.oldPassword, newPassword: this.newPassword })
      .subscribe({
        next: (res) => {
          this.pwdMsg = res?.message || 'Lozinka je promenjena.';
          this.oldPassword = this.newPassword = this.confirmPassword = '';
        },
        error: (err) => this.pwdMsg = err?.error?.message || 'Greška pri promeni lozinke.'
      });
  }
}

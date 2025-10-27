// src/app/components/profile/profile.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../env/environment';

const PASS_RE =
  /^(?=[A-Za-z])(?=.*[A-Z])(?=(?:.*[a-z]){3,})(?=.*\d)(?=.*[^A-Za-z0-9]).{6,10}$/;

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

    // Provera tipa fajla
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMsg = 'Dozvoljeni su samo JPG i PNG formati';
      input.value = '';
      return;
    }

    // Provera veličine fajla (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'Slika ne sme biti veća od 5MB';
      input.value = '';
      return;
    }

    // Provera dimenzija slike (min 100x100, max 300x300)
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      img.src = e.target.result;
      
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          this.errorMsg = 'Slika mora biti najmanje 100x100 px';
          input.value = '';
          return;
        }
        
        if (img.width > 300 || img.height > 300) {
          this.errorMsg = 'Slika ne sme biti veća od 300x300 px';
          input.value = '';
          return;
        }

        // Sve je OK, postavi fajl i preview
        this.imageFile = file;
        this.imagePreview = e.target.result;
        this.errorMsg = '';
      };
    };
    
    reader.readAsDataURL(file);
  }

  getImageUrl(): string {
    // Ako ima preview nakon upload-a
    if (this.imagePreview) return this.imagePreview;
    
    // Ako user ima sliku sa backend-a
    if (this.user.image) {
      // Backend vraća putanju kao 'uploads/defaults/user.png' ili 'uploads/users/xyz.png'
      return `${environment.uploadsUrl}/${this.user.image}`;
    }
    
    // Fallback placeholder
    return 'assets/avatar-placeholder.png';
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
    if (this.oldPassword === this.newPassword) {
      this.pwdMsg = 'Stara i nova lozinka ne smeju biti iste.';
      return;
    }
    if (!PASS_RE.test(this.newPassword)) {
      this.pwdMsg = 'Nova lozinka nije u traženom formatu (6-10 karaktera, počinje slovom, sadrži veliko slovo, 3+ mala slova, broj i specijalan karakter).';
      return;
    }

    const username = this.user.username;
    this.auth.changePassword({ username, oldPassword: this.oldPassword, newPassword: this.newPassword })
      .subscribe({
        next: (res) => {
          this.pwdMsg = 'Lozinka je uspešno promenjena. Vraćamo Vas na stranicu za prijavljivanje...';
          this.oldPassword = this.newPassword = this.confirmPassword = '';
          // Vrati korisnika na login nakon uspešne promene
          setTimeout(() => {
            this.auth.logout();
            this.router.navigateByUrl('/login');
          }, 2000);
        },
        error: (err) => this.pwdMsg = err?.error?.message || 'Greška pri promeni lozinke.'
      });
  }
}

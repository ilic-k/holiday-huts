import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  auth = inject(AuthService);
  router = inject(Router);

  // Polja forme
  username = '';
  password = '';
  confirmPassword = '';
  role: 'turista' | 'vlasnik' = 'turista';
  name = '';
  lastname = '';
  gender: 'M' | 'Z' = 'M';
  address = '';
  phone = '';
  email = '';
  creditCard = '';
  image: File | null = null;

  errorMsg = '';
  successMsg = '';

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Provera tipa - samo JPG i PNG
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMsg = 'Dozvoljeni su samo JPG i PNG formati';
        return;
      }
      this.image = file;
      this.errorMsg = '';
    }
  }

  validateForm(): boolean {
    this.errorMsg = '';

    if (!this.username || !this.email || !this.password) {
      this.errorMsg = 'Popunite sva obavezna polja';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Lozinke se ne poklapaju';
      return false;
    }

    // Regex kopiran sa back-a
    const PASS_RE = /^(?=[A-Za-z])(?=.*[A-Z])(?=(?:.*[a-z]){3,})(?=.*\d)(?=.*[^A-Za-z0-9]).{6,10}$/;
    if (!PASS_RE.test(this.password)) {
      this.errorMsg = 'Lozinka mora imati min. 8 karaktera, veliko slovo, malo slovo, broj i specijalan karakter (@$!%*?&#)';
      return false;
    }

    // Validacija email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMsg = 'Email adresa nije validna';
      return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.validateForm()) return;

    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('password', this.password);
    formData.append('role', this.role);
    formData.append('name', this.name);
    formData.append('lastname', this.lastname);
    formData.append('gender', this.gender);
    formData.append('address', this.address);
    formData.append('phone', this.phone);
    formData.append('email', this.email);
    formData.append('creditCard', this.creditCard);
    if (this.image) {
      formData.append('image', this.image);
    }

    this.auth.register(formData).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Registracija uspešna! Čeka se odobrenje admina.';
        this.errorMsg = '';
        setTimeout(() => this.router.navigateByUrl('/login'), 2000);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Greška pri registraciji';
        this.successMsg = '';
      }
    });
  }
}

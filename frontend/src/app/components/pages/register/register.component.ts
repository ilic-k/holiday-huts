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
  cardType: 'diners' | 'mastercard' | 'visa' | null = null;

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Provera tipa - samo JPG i PNG
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMsg = 'Dozvoljeni su samo JPG i PNG formati';
        event.target.value = '';
        return;
      }

      // Provera veličine (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = 'Slika ne sme biti veća od 5MB';
        event.target.value = '';
        return;
      }

      // Provera dimenzija (min 100x100, max 300x300)
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        img.src = e.target.result;
        
        img.onload = () => {
          if (img.width < 100 || img.height < 100) {
            this.errorMsg = 'Slika mora biti najmanje 100x100 px';
            event.target.value = '';
            return;
          }
          
          if (img.width > 300 || img.height > 300) {
            this.errorMsg = 'Slika ne sme biti veća od 300x300 px';
            event.target.value = '';
            return;
          }

          // Sve je OK
          this.image = file;
          this.errorMsg = '';
        };
      };
      
      reader.readAsDataURL(file);
    }
  }

  onCreditCardInput() {
    // Ukloni sve sem cifara
    const cleaned = this.creditCard.replace(/\D/g, '');
    this.creditCard = cleaned;
    
    // Detektuj tip kartice
    this.cardType = this.detectCardType(cleaned);
  }

  detectCardType(cardNumber: string): 'diners' | 'mastercard' | 'visa' | null {
    // Diners - počinje sa 300, 301, 302, 303, 36, ili 38 i ima tačno 15 cifara
    if (cardNumber.length === 15) {
      if (/^30[0-3]/.test(cardNumber) || /^3[68]/.test(cardNumber)) {
        return 'diners';
      }
    }

    // MasterCard – počinje sa 51, 52, 53, 54, ili 55 i ima tačno 16 cifara
    if (cardNumber.length === 16) {
      if (/^5[1-5]/.test(cardNumber)) {
        return 'mastercard';
      }
      
      // Visa – počinje sa 4539, 4556, 4916, 4532, 4929, 4485, 4716, i ima tačno 16 cifara
      if (/^(4539|4556|4916|4532|4929|4485|4716)/.test(cardNumber)) {
        return 'visa';
      }
    }

    return null;
  }

  validateCreditCard(): boolean {
    if (!this.creditCard) {
      this.errorMsg = 'Broj kreditne kartice je obavezan';
      return false;
    }

    const cleaned = this.creditCard.replace(/\D/g, '');
    const cardType = this.detectCardType(cleaned);

    if (!cardType) {
      this.errorMsg = 'Broj kreditne kartice nije validan. Proverite tip kartice (Diners, MasterCard, Visa).';
      return false;
    }

    return true;
  }

  validateForm(): boolean {
    this.errorMsg = '';

    if (!this.username || !this.email || !this.password || !this.name || !this.lastname || !this.address || !this.phone) {
      this.errorMsg = 'Popunite sva obavezna polja (username, email, password, ime, prezime, adresa, telefon)';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Lozinke se ne poklapaju';
      return false;
    }

    // Regex kopiran sa back-a
    const PASS_RE = /^(?=[A-Za-z])(?=.*[A-Z])(?=(?:.*[a-z]){3,})(?=.*\d)(?=.*[^A-Za-z0-9]).{6,10}$/;
    if (!PASS_RE.test(this.password)) {
      this.errorMsg = 'Lozinka mora imati 6-10 karaktera, počinje slovom, sadrži veliko slovo, 3+ mala slova, broj i specijalan karakter';
      return false;
    }

    // Validacija email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMsg = 'Email adresa nije validna';
      return false;
    }

    // Validacija kreditne kartice
    if (!this.validateCreditCard()) {
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

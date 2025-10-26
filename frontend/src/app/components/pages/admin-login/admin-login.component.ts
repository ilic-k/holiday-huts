import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMsg = '';
  loading = false;

  submit() {
    if (!this.username || !this.password || this.loading) return;

    this.errorMsg = '';
    this.loading = true;

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        const u = Object.assign(new User(), res.user);
        
        // Validacija da je korisnik admin
        if (u.role !== 'admin') {
          this.errorMsg = 'Nemate administratorska prava. Ova forma je samo za administratore.';
          this.loading = false;
          this.auth.logout(); // Odjavi korisnika
          return;
        }

        this.auth.setUser(u);
        this.router.navigateByUrl('/admin/cottages');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Greška pri prijavi';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // opciono, možeš obrisati ako ne koristiš
})
export class LoginComponent {
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
        this.auth.setUser(u);
        this.router.navigateByUrl('/cottages');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Greška pri prijavi';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/cottages');
  }
}

import { Routes } from '@angular/router';

import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { AdminLoginComponent } from './components/pages/admin-login/admin-login.component';
import { CottagesListComponent } from './components/pages/cottages-list/cottages-list.component';
import { CottageDetailsComponent } from './components/pages/cottage-details/cottage-details.component';
import { ProfileComponent } from './components/pages/profile/profile.component';
import { MyReservationsComponent } from './components/pages/my-reservations/my-reservations.component';
import { MyCottagesComponent } from './components/pages/my-cottages/my-cottages.component';
import { OwnerReservationsComponent } from './components/pages/owner-reservations/owner-reservations.component';
import { AdminCottagesComponent } from './components/pages/admin-cottages/admin-cottages.component';

export const routes: Routes = [
  // AUTH
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // ADMIN AUTH (posebna ruta - nije javno vidljiva)
  { path: 'sys/admin/login', component: AdminLoginComponent },

  // PUBLIC
  { path: 'cottages', component: CottagesListComponent },
  { path: 'cottages/:id', component: CottageDetailsComponent },

  // USER (turista)
  { path: 'me', component: ProfileComponent },
  { path: 'me/reservations', component: MyReservationsComponent },

  // OWNER (vlasnik)
  { path: 'owner/cottages', component: MyCottagesComponent },
  { path: 'owner/reservations', component: OwnerReservationsComponent },

  // ADMIN
  { path: 'admin/cottages', component: AdminCottagesComponent },

  // DEFAULT + FALLBACK
  { path: '', redirectTo: '/cottages', pathMatch: 'full' },
  { path: '**', redirectTo: '/cottages' }
];

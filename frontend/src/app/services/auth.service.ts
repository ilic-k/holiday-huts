import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private user: User | null = null;

  constructor() {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { this.user = Object.assign(new User(), JSON.parse(raw)); }
      catch { this.user = null; }
    }
  }

  getCurrentUser(): User | null { return this.user; }
  isLoggedIn(): boolean { return !!this.user; }
  hasRole(role: Role): boolean { return this.user?.role === role; }

  setUser(u: User | null) {
    this.user = u;
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  }

  logout() { this.setUser(null); }

  login(body: { username: string; password: string }) {
    return this.http.post<{ message: string; user: any }>(
      `${environment.apiBaseUrl}/auth/login`, body
    );
  }

  register(body: any) {
    return this.http.post<{ message: string; id?: string }>(
      `${environment.apiBaseUrl}/auth/register`, body
    );
  }

  getProfile(username: string) {
    return this.http.get<any>(`${environment.apiBaseUrl}/user/${username}`);
  }

  updateProfile(username: string, body: any) {
    return this.http.patch<any>(`${environment.apiBaseUrl}/user/${username}`, body);
  }

  changePassword(body: { username: string; oldPassword: string; newPassword: string }) {
    return this.http.post<{ message: string }>(`${environment.apiBaseUrl}/auth/change-password`, body);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  http = inject(HttpClient);

  // ========== USER MANAGEMENT ==========
  getAllUsers() {
    return this.http.get(`${environment.apiBaseUrl}/admin/users`);
  }

  createUser(userData: any) {
    return this.http.post(`${environment.apiBaseUrl}/admin/users`, userData);
  }

  updateUser(id: string, updates: any) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/users/${id}`, updates);
  }

  deleteUser(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/admin/users/${id}`);
  }

  deactivateUser(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/users/${id}/deactivate`, {});
  }

  activateUser(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/users/${id}/activate`, {});
  }

  // ========== REGISTRATION APPROVAL ==========
  getPendingUsers() {
    return this.http.get(`${environment.apiBaseUrl}/admin/users/pending`);
  }

  approveUser(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/users/${id}/approve`, {});
  }

  rejectUser(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/admin/users/${id}/reject`);
  }

  // ========== COTTAGE QUALITY CONTROL ==========
  getAllCottagesQuality() {
    return this.http.get(`${environment.apiBaseUrl}/admin/cottages/all`);
  }

  block48h(cottageId: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/cottages/${cottageId}/block-48h`, {});
  }
}

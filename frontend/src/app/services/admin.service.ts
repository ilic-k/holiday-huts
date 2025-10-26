import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  http = inject(HttpClient);

  // Korisnici
  getPendingUsers() {
    return this.http.get(`${environment.apiBaseUrl}/admin/users/pending`);
  }

  approveUser(id: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/users/${id}/approve`, {});
  }

  rejectUser(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/admin/users/${id}/reject`);
  }

  // Vikendice - Quality Control
  getAllCottagesQuality() {
    return this.http.get(`${environment.apiBaseUrl}/admin/cottages/all`);
  }

  block48h(cottageId: string) {
    return this.http.patch(`${environment.apiBaseUrl}/admin/cottages/${cottageId}/block-48h`, {});
  }
}

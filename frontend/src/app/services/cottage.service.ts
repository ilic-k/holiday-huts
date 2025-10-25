import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';

@Injectable({ providedIn: 'root' })
export class CottageService {
  http = inject(HttpClient);

  getAll(q?: string, place?: string, sort?: string) {
    const params: any = {};
    if (q) params.q = q;
    if (place) params.place = place;
    if (sort) params.sort = sort;
    return this.http.get(`${environment.apiBaseUrl}/cottages`, { params });
  }

  getStats() {
    return this.http.get(`${environment.apiBaseUrl}/cottages/stats`);
  }

  getOne(id: string) {
    return this.http.get(`${environment.apiBaseUrl}/cottages/${id}`);
  }

  getMine(ownerId: string) {
    return this.http.get(`${environment.apiBaseUrl}/cottages/mine/${ownerId}`);
  }

  create(body: any) {
    return this.http.post(`${environment.apiBaseUrl}/cottages`, body);
  }

  update(id: string, body: any) {
    return this.http.patch(`${environment.apiBaseUrl}/cottages/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete(`${environment.apiBaseUrl}/cottages/${id}`);
  }
}

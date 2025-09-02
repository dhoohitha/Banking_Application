// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, tap } from 'rxjs';
import { CustomerResponse } from '../models/bank.models';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // GET /admin/kyc?status=PENDING&page=&size=
  listPending(
    status = 'PENDING',
    page = 0,
    size = 10
  ): Observable<{ items: CustomerResponse[]; totalPages: number; page: number }> {
    const url = `${environment.api.customer}/admin/kyc?status=${status}&page=${page}&size=${size}`;
    return this.http.get<any>(url).pipe(
      tap(res => console.log('[AdminService] /admin/kyc response:', res)),
      map(res => {
        if (res && Array.isArray(res.content)) {
          return { items: res.content as CustomerResponse[], totalPages: res.totalPages ?? 1, page: res.number ?? 0 };
        }
        if (Array.isArray(res)) {
          return { items: res as CustomerResponse[], totalPages: 1, page: 0 };
        }
        if (res && Array.isArray(res.items)) {
          return { items: res.items as CustomerResponse[], totalPages: res.totalPages ?? 1, page: res.page ?? 0 };
        }
        return { items: [], totalPages: 1, page: 0 };
      })
    );
  }

  // POST /admin/kyc/{customerId}/approve  body: { actor }
  approve(customerId: number, actor: string) {
    const url = `${environment.api.customer}/admin/kyc/${customerId}/approve`;
    return this.http.post(url, { actor });
  }

  // POST /admin/kyc/{customerId}/reject  body: { actor, reason }
  reject(customerId: number, actor: string, reason: string) {
    const url = `${environment.api.customer}/admin/kyc/${customerId}/reject`;
    return this.http.post(url, { actor, reason });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CustomerResponse } from '../models/bank.models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private http: HttpClient) {}
  saveProfile(body: { fullName: string; email: string; phone: string }) {
    return this.http.post<{ id: number }>(`${environment.api.customer}/customers`, body);
  }
  getProfile(id: number) {
    return this.http.get<CustomerResponse>(`${environment.api.customer}/customers/${id}`);
  }
  uploadKyc(id: number, body: { docType: string; docUrl: string }) {
    return this.http.post(`${environment.api.customer}/customers/${id}/kyc`, body);
  }
}

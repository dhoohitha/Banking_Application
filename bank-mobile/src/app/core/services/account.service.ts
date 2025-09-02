import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Account } from '../models/bank.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient) {}
  openAccount(body: { customerId: number; type: 'SAVINGS'|'CURRENT'|'SAVINGS' }) {
    return this.http.post(`${environment.api.account}/accounts`, body);
  }
  getAccount(id: number) {
    return this.http.get<Account>(`${environment.api.account}/accounts/${id}`);
  }
  debit(id: number, amount: number) { return this.http.post(`${environment.api.account}/accounts/${id}/debit`, { amount }); }
  credit(id: number, amount: number) { return this.http.post(`${environment.api.account}/accounts/${id}/credit`, { amount }); }
}

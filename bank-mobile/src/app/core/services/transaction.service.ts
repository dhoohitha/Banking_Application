import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LedgerLine, Page } from '../models/bank.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private http: HttpClient) {}
  internalTransfer(body: { externalId: string; fromAccountId: number; toAccountId: number; amount: number }) {
    return this.http.post(`${environment.api.transaction}/transactions/internal`, body);
  }
  externalTransfer(body: { externalId: string; fromAccountId: number; beneficiaryName: string; beneficiaryBankCode: string; beneficiaryAccountNo: string; amount: number }) {
    return this.http.post(`${environment.api.transaction}/transactions/external`, body);
  }
  history(accountId: number) {
    return this.http.get<LedgerLine[]>(`${environment.api.transaction}/transactions/history?accountId=${accountId}`);
  }
  statement(accountId: number, page=0, size=10) {
    return this.http.get<Page<any>>(`${environment.api.transaction}/transactions/statement?accountId=${accountId}&page=${page}&size=${size}`);
  }
  exportCsv(accountId: number) {
    return this.http.get(`${environment.api.transaction}/transactions/statement.csv?accountId=${accountId}`, { responseType: 'blob' });
  }
}

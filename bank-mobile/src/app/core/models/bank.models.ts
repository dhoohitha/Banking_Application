export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CustomerResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  kycStatus: KycStatus;
  docs?: { docType: string; docUrl: string; submittedAt: string }[];
}

export interface Account { id: number; type: 'SAVINGS'|'CURRENT'; balance: number; customerId: number; }
export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
export interface LedgerLine { id: string; ts: string; type: 'DEBIT'|'CREDIT'|'TRANSFER'; amount: number; runningBalance: number; description?: string; }

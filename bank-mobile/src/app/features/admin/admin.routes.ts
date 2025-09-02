import { Routes } from '@angular/router';
import { KycPendingPage } from './kyc-pending.page';
import { KycDetailPage } from './kyc-detail.page';
import { AdminUsersPage } from './users/admin-users.page'; // NEW

export const ADMIN_ROUTES: Routes = [
  { path: 'kyc', component: KycPendingPage },
  { path: 'kyc/:customerId', component: KycDetailPage },
  { path: 'users', component: AdminUsersPage },            // NEW
  { path: '', pathMatch: 'full', redirectTo: 'users' }
];

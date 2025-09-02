import { Routes } from '@angular/router';
import { UserDashboardPage } from './user-dashboard.page';
import { ProfilePage } from './profile.page';
import { KycPage } from './kyc.page';
import { AccountsPage } from './accounts/accounts.page';
import { AccountOpenPage } from './accounts/account-open.page';
import { AccountDetailPage } from './accounts/account-detail.page';
import { TransferInternalPage } from './transfers/transfer-internal.page';
import { TransferExternalPage } from './transfers/transfer-external.page';
import { TxHistoryPage } from './transactions/tx-history.page';
import { TxStatementPage } from './transactions/tx-statement.page';

export const USER_ROUTES: Routes = [
  { path: 'dashboard', component: UserDashboardPage },
  { path: 'profile', component: ProfilePage },
  { path: 'kyc', component: KycPage },

  { path: 'accounts', component: AccountsPage },
  { path: 'accounts/open', component: AccountOpenPage },
  { path: 'accounts/:id', component: AccountDetailPage },

  { path: 'transfer/internal', component: TransferInternalPage },
  { path: 'transfer/external', component: TransferExternalPage },

  { path: 'transactions/history', component: TxHistoryPage },
  { path: 'transactions/statement', component: TxStatementPage },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
];

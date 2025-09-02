import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { USER_ROUTES } from './features/user/user.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'auth', children: AUTH_ROUTES },

  {
    path: 'user',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'USER' },
    children: USER_ROUTES
  },

  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    children: ADMIN_ROUTES
  },

  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: '**', redirectTo: 'auth/login' }
];

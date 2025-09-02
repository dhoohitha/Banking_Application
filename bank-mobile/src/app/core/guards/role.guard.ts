import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expected = route.data?.['role'];
    const role = localStorage.getItem('role');
    return role === expected ? true : this.router.parseUrl('/auth/login');
  }
}

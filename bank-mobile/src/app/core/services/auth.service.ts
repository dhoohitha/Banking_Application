import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type Role = 'ADMIN' | 'USER';
interface LoginResponse { token: string; email: string; role: Role; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private state$ = new BehaviorSubject<LoginResponse | null>(null);
  readonly currentUser$ = this.state$.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role') as Role | null;
    if (token && email && role) this.state$.next({ token, email, role });
  }

  register(dto: { email: string; password: string }) {
    return this.http.post<{ ok: boolean }>(`${environment.api.auth}/auth/register`, dto);
  }

  login(dto: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${environment.api.auth}/auth/login`, dto)
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.email);
        localStorage.setItem('role', res.role);
        this.state$.next(res);
      }));
  }

  logout() {
    localStorage.clear();
    this.state$.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Small helpers to avoid "getEmail() missing" errors in components
  getToken() { return localStorage.getItem('token'); }
  getEmail() { return localStorage.getItem('email'); }
  getRole()  { return localStorage.getItem('role') as Role | null; }
  isLoggedIn() { return !!this.getToken(); }
}

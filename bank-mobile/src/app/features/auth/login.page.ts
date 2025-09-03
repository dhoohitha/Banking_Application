import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import {
  IonContent, IonItem, IonLabel, IonInput,
  IonButton, IonList, IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, NgIf, RouterLink,
    IonContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonText
  ],
styles: [`
  .login-page {
    --background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  ion-content::part(scroll) {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .login-card {
    background: #ffffff;
    width: 420px;          /* increased from 340px */
    max-width: 90%;        /* prevent overflow on small devices */
    padding: 32px;         /* increased padding */
    border-radius: 20px;   /* slightly rounder */
    box-shadow: 0 12px 28px rgba(0,0,0,0.25);
    text-align: center;
    animation: fadeIn 0.5s ease;
  }

  .brand {
    font-size: 32px;       /* bigger title */
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 20px;
    background: linear-gradient(90deg,#6a11cb,#2575fc);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  ion-item {
    margin-bottom: 12px;
  }

  .login-btn {
    margin-top: 18px;
    --background: linear-gradient(90deg,#6a11cb,#2575fc);
    --border-radius: 12px;
    height: 48px;         /* taller button */
    font-size: 1.1rem;
  }

  .aux {
    margin-top: 16px;
    font-size: 1rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`],

  template: `
    <ion-content class="login-page">
      <div class="login-card">
        <div class="brand">BANK</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <ion-list>
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input type="email" formControlName="email" autocomplete="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Password</ion-label>
              <ion-input type="password" formControlName="password" autocomplete="current-password"></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" type="submit" class="login-btn"
            [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in...' : 'Login' }}
          </ion-button>

          <div class="aux">
            <a routerLink="/auth/register">Create an account</a>
          </div>

          <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
        </form>
      </div>
    </ion-content>
  `
})
export class LoginPage {
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value as any).subscribe({
      next: (res: any) => {
        // Save token if provided
        const token = res?.token ?? res?.accessToken;
        if (token) localStorage.setItem('auth_token', token);

        // Decide role
        const role = this.extractRole(res, token);

        // Stop loading before navigating
        this.loading = false;

        // Route by role
        this.router.navigateByUrl(
          role === 'ADMIN' ? '/admin/kyc' : '/user/dashboard',
          { replaceUrl: true }
        );
      },
      error: (err) => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  private extractRole(res: any, token?: string): string {
    // 1) Direct fields from response
    const direct =
      res?.role ??
      res?.roles?.[0] ??
      res?.authority ??
      res?.authorities?.[0];

    if (direct) return String(direct).toUpperCase();

    // 2) Decode JWT if available
    const jwt = token ?? localStorage.getItem('auth_token') ?? '';
    if (jwt && jwt.includes('.')) {
      try {
        const payload = JSON.parse(
          atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        const claim =
          payload?.role ??
          payload?.roles?.[0] ??
          payload?.authorities?.[0];
        if (claim) return String(claim).toUpperCase();
      } catch { /* ignore bad token */ }
    }

    // 3) Default to USER
    return 'USER';
  }
}

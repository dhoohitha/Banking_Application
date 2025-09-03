// src/app/features/auth/register.page.ts
import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonItem, IonLabel, IonInput,
  IonList, IonButton, IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule, ReactiveFormsModule, NgIf, RouterLink,
    IonContent, IonItem, IonLabel, IonInput, IonList, IonButton, IonText
  ],
  styles: [`
    .register-page {
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

    .register-card {
      background: #ffffff;
      width: 420px;
      max-width: 90%;
      padding: 32px;
      border-radius: 20px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.25);
      text-align: center;
      animation: fadeIn 0.5s ease;
    }

    .brand {
      font-size: 32px;
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

    .submit-btn {
      margin-top: 18px;
      --background: linear-gradient(90deg,#6a11cb,#2575fc);
      --border-radius: 12px;
      height: 48px;
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
    <ion-content class="register-page">
      <div class="register-card">
        <div class="brand">BANK</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-list>
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input formControlName="email" type="email" autocomplete="email"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Password</ion-label>
              <ion-input formControlName="password" type="password" autocomplete="new-password"></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" type="submit" class="submit-btn"
            [disabled]="form.invalid || loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </ion-button>

          <div class="aux">
            Already have an account?
            <a routerLink="/auth/login">Login</a>
          </div>

          <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
          <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
        </form>
      </div>
    </ion-content>
  `
})
export class RegisterPage {
  loading = false;
  message = '';
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  submit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.message = '';
    this.error = '';

    const body = this.form.value as { email: string; password: string };
    this.auth.register(body).subscribe({
      next: (res) => {
        this.message = res?.ok
          ? 'Registered successfully. You can login now.'
          : 'Registered.';
        this.loading = false;
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || `Registration failed (${err?.status || 400}).`;
        this.error = String(msg);
        this.loading = false;
      }
    });
  }
}

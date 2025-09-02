// src/app/features/auth/register.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonList, IonButton, IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonList, IonButton, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar><ion-title>Register</ion-title></ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
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

    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
      {{ loading ? 'Registering...' : 'Register' }}
    </ion-button>

    <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
    <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
  </form>
</ion-content>
`})
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
    if (this.form.invalid) return;
    this.loading = true; this.message = ''; this.error = '';

    const body = this.form.value as { email: string; password: string };
    this.auth.register(body).subscribe({
      next: (res) => {
        // backend returns { ok: true }
        this.message = res?.ok ? 'Registered successfully. You can login now.' : 'Registered.';
        this.loading = false;
      },
      error: (err) => {
        // surface backend reason (e.g., "email already exists")
        const msg = err?.error?.message || err?.error || `Registration failed (${err?.status || 400}).`;
        this.error = String(msg);
        this.loading = false;
      }
    });
  }
}

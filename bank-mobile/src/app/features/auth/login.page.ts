import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonText } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf,RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonText],
  template: `
<ion-header><ion-toolbar><ion-title>Login</ion-title></ion-toolbar></ion-header>
<ion-content class="ion-padding">
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
    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Signing in...' : 'Login' }}</ion-button>
    <div class="ion-text-center ion-padding-top">
      <a routerLink="/auth/register">Create an account</a>
    </div>
    <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
  </form>
</ion-content>
`})
export class LoginPage {
  loading = false;
  error = '';
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.login(this.form.value as any).subscribe({
      next: res => {
        // route by role
        const role = res.role;
        window.location.href = role === 'ADMIN' ? '/admin/kyc' : '/user/dashboard';
      },
      error: err => {
        this.error = err?.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }
}

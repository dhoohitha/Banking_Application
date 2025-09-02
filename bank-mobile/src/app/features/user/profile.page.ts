import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput,
  IonButton, IonList, IonText, IonButtons, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerResponse, KycStatus } from '../../core/models/bank.models';
import { addIcons } from 'ionicons';
import { logOutOutline, createOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput,
    IonButton, IonList, IonText, IonButtons, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Profile</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="toggleEdit()">
        <ion-icon name="create-outline" slot="icon-only"></ion-icon>
      </ion-button>
      <ion-button (click)="logout()">
        <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">

  <!-- Saved preview -->
  <ion-card *ngIf="profile">
    <ion-card-header><ion-card-title>Saved Profile</ion-card-title></ion-card-header>
    <ion-card-content>
      <p><strong>Name:</strong> {{ profile.fullName }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>Phone:</strong> {{ profile.phone }}</p>
      <p>
        <strong>KYC:</strong>
        <ion-badge [color]="badgeColor(profile.kycStatus)">{{ profile.kycStatus }}</ion-badge>
      </p>
    </ion-card-content>
  </ion-card>

  <!-- Edit/create form -->
  <form [formGroup]="form" (ngSubmit)="save()" *ngIf="editing">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Full name</ion-label>
        <ion-input formControlName="fullName"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Email</ion-label>
        <ion-input formControlName="email" type="email" readonly="true"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Phone</ion-label>
        <ion-input formControlName="phone" type="tel"></ion-input>
      </ion-item>
    </ion-list>
    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
      {{ loading ? 'Saving...' : 'Save Profile' }}
    </ion-button>
    <ng-container *ngIf="message"><ion-text color="success">{{ message }}</ion-text></ng-container>
    <ng-container *ngIf="error"><ion-text color="danger">{{ error }}</ion-text></ng-container>
  </form>

  <ion-text *ngIf="!profile && !editing">No profile yet. Tap the ✏️ to create one.</ion-text>
</ion-content>
`})
export class ProfilePage implements OnInit {
  loading = false; message = ''; error = '';
  editing = false;
  profile: CustomerResponse | null = null;

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: [this.auth.getEmail() || '', [Validators.required, Validators.email]],
    phone: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private cs: CustomerService, private auth: AuthService) {
    addIcons({ logOutOutline, createOutline });
  }

  ngOnInit() {
    this.loadProfileIfExists();
  }

  private loadProfileIfExists() {
    const id = Number(localStorage.getItem('customerId') || 0);
    if (!id) { this.editing = true; return; } // first-time user → show form
    this.cs.getProfile(id).subscribe({
      next: (res) => {
        this.profile = res;
        // prefill form but keep email readonly (source of truth from login)
        this.form.patchValue({ fullName: res.fullName || '', email: res.email || this.auth.getEmail(), phone: res.phone || '' });
        this.editing = false; // show preview by default
      },
      error: () => { this.editing = true; } // if fetch fails, let user enter details
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true; this.message = ''; this.error = '';
    this.cs.saveProfile(this.form.value as any).subscribe({
      next: (res) => {
        const id = Number(res?.id);
        if (id) localStorage.setItem('customerId', String(id));
        this.message = `Saved. Customer ID: ${id}`;
        this.loading = false;
        // reload saved profile from server to reflect KYC status, etc.
        this.profile = null;
        setTimeout(() => this.loadProfileIfExists(), 50);
        this.editing = false;
      },
      error: () => { this.loading = false; this.error = 'Save failed'; }
    });
  }

  toggleEdit() { this.editing = !this.editing; }
  logout() { this.auth.logout(); }

  badgeColor(status: KycStatus | undefined) {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'medium';
    }
  }
}

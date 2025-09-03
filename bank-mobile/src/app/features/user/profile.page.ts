import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput,
  IonButton, IonList, IonText, IonButtons, IonIcon, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonBadge, IonAvatar, IonLoading
} from '@ionic/angular/standalone';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerResponse, KycStatus } from '../../core/models/bank.models';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  createOutline,
  personCircleOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonButton, IonList, IonText,
    IonButtons, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonAvatar, IonLoading
  ],
  styles: [`
    .gradient-toolbar {
      --background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: #fff;
    }

    ion-content {
      --padding-start: clamp(12px, 3vw, 20px);
      --padding-end: clamp(12px, 3vw, 20px);
      --padding-top: clamp(12px, 2.4vw, 16px);
      --padding-bottom: clamp(18px, 3.2vw, 28px);
    }

    .page-container {
      width: 100%;
      max-width: 840px;
      margin: 0 auto;
    }

    .profile-card, .form-card {
      border-radius: 16px;
      box-shadow: 0 10px 26px rgba(0,0,0,0.12);
      background: #fff;
      overflow: hidden;
      animation: fadeIn .35s ease;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 18px;
      border-radius: 999px;
    }

    .subtle {
      color: var(--ion-color-medium);
      font-size: 13px;
    }

    .row-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .empty {
      display: grid;
      place-items: center;
      text-align: center;
      padding: 36px 12px 8px;
      color: var(--ion-color-medium);
    }
    .empty .big-icon {
      font-size: 64px;
      color: var(--ion-color-primary);
      opacity: .85;
      margin-bottom: 8px;
    }
    .empty h3 { margin: 8px 0 6px; font-weight: 800; }
    .empty p { margin: 0 0 16px; font-size: 13px; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>Profile</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleEdit()" aria-label="Edit">
            <ion-icon name="create-outline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="page-container">

        <!-- Saved profile preview -->
        <ion-card class="profile-card" *ngIf="profile && !editing">
          <ion-card-content>
            <div class="profile-header">
              <ion-avatar class="avatar" aria-hidden="true">
                <span>{{ initials(profile.fullName || emailFallback) }}</span>
              </ion-avatar>
              <div>
                <div style="font-weight:800; font-size:18px;">
                  {{ profile.fullName || '—' }}
                </div>
                <div class="subtle">{{ profile.email || emailFallback }}</div>
                <div class="subtle">{{ profile.phone || '—' }}</div>
              </div>

              <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
                <ion-badge [color]="badgeColor(profile.kycStatus)">
                  {{ profile.kycStatus || 'UNKNOWN' }}
                </ion-badge>
              </div>
            </div>

            <div class="row-actions">
              <ion-button (click)="toggleEdit()">Edit Profile</ion-button>
              <ion-button fill="outline" routerLink="/user/kyc">KYC</ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Edit/create form -->
        <ion-card class="form-card" *ngIf="editing">
          <ion-card-header>
            <ion-card-title>Edit Profile</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form [formGroup]="form" (ngSubmit)="save()">
              <ion-list lines="inset">
                <ion-item>
                  <ion-label position="stacked">Full name</ion-label>
                  <ion-input formControlName="fullName" autocomplete="name"></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input formControlName="email" type="email" [readonly]="true"></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Phone</ion-label>
                  <ion-input formControlName="phone" type="tel" autocomplete="tel"></ion-input>
                </ion-item>
              </ion-list>

              <div class="row-actions">
                <ion-button type="submit" [disabled]="form.invalid || loading">
                  {{ loading ? 'Saving...' : 'Save Profile' }}
                </ion-button>
                <ion-button fill="outline" type="button" (click)="toggleEdit()">Cancel</ion-button>
                <ion-button fill="outline" routerLink="/user/kyc">Go to KYC</ion-button>
              </div>

              <div class="row-actions" *ngIf="message">
                <ion-text color="success">{{ message }}</ion-text>
              </div>
              <div class="row-actions" *ngIf="error">
                <ion-text color="danger">{{ error }}</ion-text>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Empty state -->
        <div class="empty" *ngIf="!profile && !editing">
          <ion-icon class="big-icon" name="information-circle-outline"></ion-icon>
          <h3>No profile yet</h3>
          <p>Create your profile to unlock all features.</p>
          <ion-button (click)="toggleEdit()">Create Profile</ion-button>
        </div>

      </div>

      <ion-loading [isOpen]="loading" message="Saving..." spinner="bubbles"></ion-loading>
    </ion-content>
  `
})
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
    addIcons({ logOutOutline, createOutline, personCircleOutline, informationCircleOutline });
  }

  ngOnInit() {
    this.loadProfileIfExists();
  }

  get emailFallback() {
    return this.auth.getEmail() || '';
  }

  initials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'U';
    }

  private loadProfileIfExists() {
    const id = Number(localStorage.getItem('customerId') || 0);
    if (!id) { this.editing = true; return; } // first-time user → show form
    this.cs.getProfile(id).subscribe({
      next: (res) => {
        this.profile = res;
        // prefill form but keep email readonly (source of truth from login)
        this.form.patchValue({
          fullName: res.fullName || '',
          email: res.email || this.auth.getEmail(),
          phone: res.phone || ''
        });
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

// kyc.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonList, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonProgressBar, IonLoading
} from '@ionic/angular/standalone';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  documentTextOutline,
  cloudUploadOutline,
  checkmarkCircleOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-kyc',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonList, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonProgressBar, IonLoading
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
      display: grid;
      place-items: center;
    }

    .page-card {
      width: min(92vw, 680px);
      border-radius: 20px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.14);
      background: #fff;
      overflow: hidden;
      animation: fadeIn .35s ease;
    }
    .card-title {
      display: flex; align-items: center; gap: 10px;
      font-weight: 800; letter-spacing: .2px;
    }

    .stepper {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }
    .step {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 10px;
      background: #f6f7fb; color: var(--ion-color-medium);
      font-size: 12px; font-weight: 600;
    }
    .step span {
      display: inline-grid; place-items: center;
      width: 20px; height: 20px; border-radius: 999px;
      background: #e6e8f2; color: #555;
      font-size: 12px; font-weight: 800;
    }
    .step.active {
      background: rgba(37,117,252,0.12);
      color: var(--ion-color-primary);
    }
    .step.active span {
      background: var(--ion-color-primary);
      color: #fff;
    }

    .actions {
      display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;
    }
    .hint { color: var(--ion-color-medium); font-size: 12px; margin-top: 8px; }
    .review { display: grid; gap: 8px; margin-top: 8px; }
    .review .row { display: flex; gap: 10px; align-items: baseline; }
    .review .label { color: var(--ion-color-medium); font-size: 12px; }

    .empty {
      text-align: center; color: var(--ion-color-medium);
      margin-top: 12px;
    }
    .empty .big-icon { font-size: 48px; color: var(--ion-color-primary); opacity: .85; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>KYC</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card class="page-card">
        <ion-card-header>
          <ion-card-title class="card-title">
            <ion-icon name="document-text-outline"></ion-icon>
            Verify your identity
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <!-- Stepper -->
          <div class="stepper">
            <div class="step" [class.active]="step >= 1"><span>1</span> Type</div>
            <div class="step" [class.active]="step >= 2"><span>2</span> Document</div>
            <div class="step" [class.active]="step >= 3"><span>3</span> Review</div>
          </div>
          <ion-progress-bar [value]="(step - 1) / 2"></ion-progress-bar>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <ng-container [ngSwitch]="step">

              <!-- Step 1: Type -->
              <div *ngSwitchCase="1">
                <ion-list lines="inset">
                  <ion-item>
                    <ion-label position="stacked">Document Type</ion-label>
                    <ion-select formControlName="docType" interface="popover">
                      <ion-select-option value="PAN">PAN</ion-select-option>
                      <ion-select-option value="AADHAAR">AADHAAR</ion-select-option>
                      <ion-select-option value="PASSPORT">PASSPORT</ion-select-option>
                    </ion-select>
                  </ion-item>
                </ion-list>

                <div class="actions">
                  <ion-button (click)="next()" [disabled]="form.controls.docType.invalid">
                    Next
                  </ion-button>
                </div>
              </div>

              <!-- Step 2: Document -->
              <div *ngSwitchCase="2">
                <ion-list lines="inset">
                  <ion-item>
                    <ion-label position="stacked">Document URL</ion-label>
                    <ion-input formControlName="docUrl" placeholder="https://..."></ion-input>
                  </ion-item>
                </ion-list>

                <div class="hint">
                  Paste a secure link to your document (starts with <b>http</b> or <b>https</b>).
                </div>
                <div *ngIf="form.controls.docUrl.touched && form.controls.docUrl.invalid">
                  <ion-text color="danger">Enter a valid URL.</ion-text>
                </div>

                <div class="actions">
                  <ion-button fill="outline" (click)="back()">Back</ion-button>
                  <ion-button (click)="next()" [disabled]="form.controls.docUrl.invalid">Next</ion-button>
                </div>
              </div>

              <!-- Step 3: Review -->
              <div *ngSwitchCase="3">
                <div class="review">
                  <div class="row">
                    <span class="label">Customer ID:</span>
                    <strong *ngIf="customerId; else noId">#{{ customerId }}</strong>
                    <ng-template #noId><ion-text color="danger">Not set</ion-text></ng-template>
                  </div>
                  <div class="row">
                    <span class="label">Type:</span> {{ form.value.docType }}
                  </div>
                  <div class="row">
                    <span class="label">URL:</span>
                    <a [href]="form.value.docUrl" target="_blank" rel="noopener">{{ form.value.docUrl }}</a>
                  </div>
                </div>

                <div class="actions">
                  <ion-button fill="outline" (click)="back()">Back</ion-button>
                  <ion-button type="submit" [disabled]="form.invalid || loading || !customerId">
                    <ion-icon slot="start" name="cloud-upload-outline"></ion-icon>
                    {{ loading ? 'Submitting...' : 'Submit KYC' }}
                  </ion-button>
                </div>

                <div class="actions" *ngIf="message">
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <ion-text color="success">{{ message }}</ion-text>
                </div>
                <div class="actions" *ngIf="error">
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <ion-text color="danger">{{ error }}</ion-text>
                </div>
              </div>

            </ng-container>
          </form>

          <!-- Tip if no profile -->
          <div class="empty" *ngIf="!customerId">
            <ion-icon class="big-icon" name="information-circle-outline"></ion-icon>
            <p>Create your profile first so we can attach your KYC.</p>
            <ion-button fill="outline" routerLink="/user/profile">Go to Profile</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-loading [isOpen]="loading" message="Uploading..." spinner="bubbles"></ion-loading>
    </ion-content>
  `
})
export class KycPage {
  step = 1;
  loading = false; message = ''; error = '';
  customerId = Number(localStorage.getItem('customerId') || 0);

  form = this.fb.group({
    docType: ['PAN', Validators.required],
    docUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/[^\s]+)$/i)]]
  });

  constructor(private fb: FormBuilder, private cs: CustomerService, private auth: AuthService) {
    addIcons({
      logOutOutline, documentTextOutline, cloudUploadOutline,
      checkmarkCircleOutline, informationCircleOutline
    });
  }

  next() {
    if (this.step === 1 && this.form.controls.docType.invalid) return;
    if (this.step === 2 && this.form.controls.docUrl.invalid) return;
    this.step = Math.min(3, this.step + 1);
  }

  back() {
    this.step = Math.max(1, this.step - 1);
  }

  submit() {
    if (!this.customerId) { this.error = 'Create profile first.'; return; }
    if (this.form.invalid) return;

    this.loading = true; this.error = ''; this.message = '';
    this.cs.uploadKyc(this.customerId, this.form.value as any).subscribe({
      next: () => {
        this.message = 'KYC submitted (PENDING).';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to upload.';
        this.loading = false;
      }
    });
  }

  logout() { this.auth.logout?.(); }
}

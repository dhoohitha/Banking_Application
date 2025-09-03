import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonLoading, IonChip
} from '@ionic/angular/standalone';
import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  walletOutline,
  informationCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-account-open',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonLoading, IonChip
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
      width: min(92vw, 560px);
      border-radius: 20px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.14);
      overflow: hidden;
      background: #fff;
      animation: fadeIn .4s ease;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      letter-spacing: .2px;
    }
    .accent {
      background: linear-gradient(90deg,#6a11cb,#2575fc);
      height: 4px;
      width: 100%;
    }

    .help {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--ion-color-medium);
      font-size: 13px;
      margin: 6px 0 14px;
    }
    .help ion-icon { font-size: 18px; }

    .form-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .success-row, .error-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      font-weight: 600;
    }
    .success-row { color: var(--ion-color-success); }
    .error-row { color: var(--ion-color-danger); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>Open Account</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-card class="page-card">
        <div class="accent"></div>
        <ion-card-header>
          <ion-card-title class="card-title">
            <ion-icon name="wallet-outline"></ion-icon>
            New Bank Account
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <div class="help">
            <ion-icon name="information-circle-outline"></ion-icon>
            <div>
              Choose an account type and create it under your profile
              <strong *ngIf="customerId">#{{ customerId }}</strong>.
              You can set it as <strong>Primary</strong> from the Accounts list after creation.
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="open()">
            <ion-list lines="inset">
              <ion-item>
                <ion-label position="stacked">Account Type</ion-label>
                <ion-select formControlName="type" interface="popover">
                  <ion-select-option value="SAVINGS">SAVINGS</ion-select-option>
                  <!-- Add other types when backend supports them:
                  <ion-select-option value="CHECKING">CHECKING</ion-select-option>
                  <ion-select-option value="CURRENT">CURRENT</ion-select-option>
                  -->
                </ion-select>
              </ion-item>
            </ion-list>

            <div class="form-actions">
              <ion-button type="submit" [disabled]="form.invalid || loading" expand="block">
                {{ loading ? 'Opening...' : 'Open Account' }}
              </ion-button>
              <ion-button fill="outline" routerLink="/user/accounts" expand="block">
                Go to Accounts
              </ion-button>
            </div>

            <div class="success-row" *ngIf="message">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <ion-text color="success">{{ message }}</ion-text>
            </div>
            <div class="error-row" *ngIf="error">
              <ion-icon name="information-circle-outline"></ion-icon>
              <ion-text color="danger">{{ error }}</ion-text>
            </div>
          </form>
        </ion-card-content>
      </ion-card>

      <ion-loading [isOpen]="loading" message="Creating account..." spinner="bubbles"></ion-loading>
    </ion-content>
  `
})
export class AccountOpenPage {
  loading = false;
  message = '';
  error = '';
  customerId = Number(localStorage.getItem('customerId') || 0);

  form = this.fb.group({
    type: ['SAVINGS', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private account: AccountService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) {
    addIcons({
      logOutOutline,
      walletOutline,
      informationCircleOutline,
      checkmarkCircleOutline
    });
  }

  open() {
    const customerId = this.customerId;
    if (!customerId) { this.error = 'Create profile (customer) first.'; return; }

    this.loading = true; this.error = ''; this.message = '';
    this.account.openAccount({ customerId, type: this.form.value.type as any }).subscribe({
      next: (res: any) => {
        const newId = Number(res?.id ?? res);
        if (newId) this.reg.add(newId);
        this.message = `Account opened successfully. ID: ${newId ?? '—'}`;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to open account.';
        this.loading = false;
      }
    });
  }

  logout() { this.auth.logout(); }
}

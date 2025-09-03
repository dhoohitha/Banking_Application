import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton,
  IonItem, IonLabel, IonInput, IonList, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonChip, IonSkeletonText
} from '@ionic/angular/standalone';

import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  logOutOutline,
  arrowBackOutline,
  walletOutline,
  star, starOutline,
  arrowDownCircleOutline, // credit
  arrowUpCircleOutline,   // debit
  refreshOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-account-detail',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton,
    IonItem, IonLabel, IonInput, IonList, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonChip, IonSkeletonText
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
    .page-container { max-width: 1120px; margin: 0 auto; }

    .summary-card, .actions-card {
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.12);
      background: #fff;
    }
    .summary-top {
      display:flex; align-items:center; gap:12px; margin-bottom:8px;
    }
    .acct-title { font-weight: 800; letter-spacing: .2px; }
    .wallet-icon { font-size: 28px; color: var(--ion-color-primary); }
    .chip-primary {
      background: linear-gradient(90deg,#6a11cb,#2575fc);
      color: #fff; font-weight: 700;
    }

    .balance-box {
      display:flex; align-items: baseline; gap:10px; min-height: 32px;
    }
    .balance-label { color: var(--ion-color-medium); font-size: 12px; letter-spacing: .3px; }
    .balance-value { font-size: clamp(22px, 4vw, 28px); font-weight: 800; }

    .actions-grid { row-gap: 16px; }
    .btn-row {
      display:flex; gap:10px; flex-wrap:wrap; margin-top: 6px;
    }
    .inline-info { margin-top: 10px; display:flex; align-items:center; gap:8px; font-weight:600; }
    .success { color: var(--ion-color-success); }
    .error { color: var(--ion-color-danger); }
    .helper { color: var(--ion-color-medium); font-size: 12px; margin-top: 6px; }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/user/accounts" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Account #{{ id }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="load()" aria-label="Refresh">
            <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="page-container">
        <ion-grid fixed class="actions-grid">
          <ion-row>
            <!-- Summary -->
            <ion-col size="12" sizeMd="6">
              <ion-card class="summary-card">
                <ion-card-content>
                  <div class="summary-top">
                    <ion-icon class="wallet-icon" name="wallet-outline"></ion-icon>
                    <div>
                      <div class="acct-title">Account #{{ id }}</div>
                      <div class="balance-label">Overview</div>
                    </div>
                    <div style="margin-left:auto;">
                      <ion-chip *ngIf="isPrimary(id)" class="chip-primary">
                        <ion-icon name="star"></ion-icon>
                        <ion-text>&nbsp;Primary</ion-text>
                      </ion-chip>
                    </div>
                  </div>

                  <div class="balance-box">
                    <div class="balance-label">Balance</div>
                    <div class="balance-value" *ngIf="balance !== null">
                      {{ balance | number:'1.2-2' }}
                    </div>
                    <ion-skeleton-text *ngIf="balance === null" [animated]="true"
                      style="width: 140px; height: 22px;"></ion-skeleton-text>
                  </div>

                  <div class="helper" *ngIf="balance !== null">
                    Tip: Use Credit to add money, Debit to withdraw.
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>

            <!-- Actions -->
            <ion-col size="12" sizeMd="6">
              <ion-card class="actions-card">
                <ion-card-header>
                  <ion-card-title>Actions</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <form [formGroup]="form">
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Amount</ion-label>
                        <ion-input type="number" inputmode="decimal" placeholder="0.00"
                                   [formControl]="amount"></ion-input>
                      </ion-item>
                    </ion-list>

                    <div class="btn-row">
                      <ion-button (click)="credit()" [disabled]="amount.invalid">
                        <ion-icon name="arrow-down-circle-outline" slot="start"></ion-icon>
                        Credit
                      </ion-button>

                      <ion-button color="danger" (click)="debit()" [disabled]="amount.invalid">
                        <ion-icon name="arrow-up-circle-outline" slot="start"></ion-icon>
                        Debit
                      </ion-button>

                      <ion-button fill="outline" (click)="setPrimary(id)">
                        <ion-icon [name]="isPrimary(id) ? 'star' : 'star-outline'" slot="start"></ion-icon>
                        {{ isPrimary(id) ? 'Primary' : 'Set Primary' }}
                      </ion-button>
                    </div>

                    <div class="inline-info success" *ngIf="message">
                      <ion-icon name="arrow-down-circle-outline"></ion-icon>
                      <ion-text>{{ message }}</ion-text>
                    </div>
                    <div class="inline-info error" *ngIf="error">
                      <ion-icon name="arrow-up-circle-outline"></ion-icon>
                      <ion-text>{{ error }}</ion-text>
                    </div>
                  </form>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `
})
export class AccountDetailPage {
  id = Number(this.route.snapshot.paramMap.get('id'));
  balance: number | null = null;

  message = '';
  error = '';

  amount = this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]);
  form = this.fb.group({}); // to host control in template (already created above)

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private account: AccountService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) {
    addIcons({
      logOutOutline,
      arrowBackOutline,
      walletOutline,
      star, starOutline,
      arrowDownCircleOutline, arrowUpCircleOutline,
      refreshOutline
    });

    // ensure this account is tracked in the registry
    this.reg.add(this.id);

    // register the amount control onto the form group
    this.form.addControl('amount', this.amount);

    this.load();
  }

  load() {
    this.message = ''; this.error = '';
    this.balance = null; // show skeleton
    this.account.getAccount(this.id).subscribe({
      next: acc => { this.balance = acc.balance; },
      error: () => { this.error = 'Could not load account'; this.balance = 0; }
    });
  }

  credit() {
    this.message = ''; this.error = '';
    const amt = Number(this.amount.value || 0);
    if (amt <= 0) { this.error = 'Enter a valid amount'; return; }

    this.account.credit(this.id, amt).subscribe({
      next: () => { this.message = 'Credited successfully'; this.load(); },
      error: () => { this.error = 'Credit failed'; }
    });
  }

  debit() {
    this.message = ''; this.error = '';
    const amt = Number(this.amount.value || 0);
    if (amt <= 0) { this.error = 'Enter a valid amount'; return; }

    this.account.debit(this.id, amt).subscribe({
      next: () => { this.message = 'Debited successfully'; this.load(); },
      error: () => { this.error = 'Debit failed'; }
    });
  }

  isPrimary(id: number): boolean {
    try {
      const anyReg = this.reg as any;
      if (typeof anyReg.isPrimary === 'function') return !!anyReg.isPrimary(id);
      if (typeof anyReg.getPrimary === 'function') return anyReg.getPrimary() === id;
      if (typeof anyReg.primary === 'number') return anyReg.primary === id;
    } catch {}
    return false;
  }

  setPrimary(id: number) {
    this.reg.setPrimary(id);
  }

  logout() { this.auth.logout(); }
}

// src/app/features/user/transfers/transfer-external.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonList, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonLoading
} from '@ionic/angular/standalone';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  logOutOutline,
  refreshOutline,
  sendOutline,
  walletOutline,
  personOutline,
  businessOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  flashOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-transfer-external',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonList, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonLoading
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
    .page-container { width: 100%; max-width: 900px; margin: 0 auto; }
    .card {
      border-radius: 16px;
      box-shadow: 0 10px 26px rgba(0,0,0,0.12);
      background: #fff;
      overflow: hidden;
      animation: fadeIn .35s ease;
    }
    .label-subtle { color: var(--ion-color-medium); font-size: 12px; letter-spacing: .3px; }
    .balance-value { font-size: clamp(20px, 4vw, 26px); font-weight: 800; }
    .row-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
    .chips { display:flex; gap:8px; flex-wrap:wrap; margin-top: 8px; }
    .chips ion-chip { cursor: pointer; }
    .success { color: var(--ion-color-success); display:flex; align-items:center; gap:8px; }
    .error { color: var(--ion-color-danger); display:flex; align-items:center; gap:8px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>External Transfer</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="refresh()" aria-label="Refresh">
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
        <!-- Wrap all controls in a form so (ngSubmit) fires correctly -->
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <ion-grid fixed>
            <ion-row>
              <!-- FROM account -->
              <ion-col size="12" sizeMd="6">
                <ion-card class="card">
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="wallet-outline"></ion-icon>
                      &nbsp;From Account
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Select account</ion-label>
                        <ion-select formControlName="fromAccountId" interface="popover" (ionChange)="onFromChange()">
                          <ion-select-option *ngFor="let id of ids" [value]="id">#{{ id }}</ion-select-option>
                        </ion-select>
                      </ion-item>

                      <ion-item>
                        <ion-label class="label-subtle">Current Balance</ion-label>
                        <div slot="end" class="balance-value" *ngIf="fromBalance !== null">
                          {{ fromBalance | number:'1.2-2' }}
                        </div>
                        <ion-skeleton-text *ngIf="fromBalance === null" [animated]="true"
                          style="width:120px;height:20px;" slot="end"></ion-skeleton-text>
                      </ion-item>
                    </ion-list>

                    <div class="row-actions">
                      <ion-button fill="outline" size="small" (click)="useMax()" [disabled]="fromBalance === null || fromBalance! <= 0">
                        Use Max
                      </ion-button>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- BENEFICIARY -->
              <ion-col size="12" sizeMd="6">
                <ion-card class="card">
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="person-outline"></ion-icon>
                      &nbsp;Beneficiary
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Name</ion-label>
                        <ion-input formControlName="beneficiaryName" autocomplete="name"></ion-input>
                      </ion-item>
                      <ion-item>
                        <ion-label position="stacked">Bank Code</ion-label>
                        <ion-input formControlName="beneficiaryBankCode" placeholder="e.g. HDFC"></ion-input>
                      </ion-item>
                      <ion-item>
                        <ion-label position="stacked">Account No.</ion-label>
                        <ion-input formControlName="beneficiaryAccountNo" inputmode="numeric" autocomplete="off"></ion-input>
                      </ion-item>
                    </ion-list>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- AMOUNT & SUBMIT -->
              <ion-col size="12">
                <ion-card class="card">
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="send-outline"></ion-icon>
                      &nbsp;Amount
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Amount</ion-label>
                        <ion-input type="number" inputmode="decimal" formControlName="amount" placeholder="e.g. 1000"></ion-input>
                      </ion-item>
                    </ion-list>

                    <div class="chips">
                      <ion-chip (click)="setAmount(500)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹500</ion-chip>
                      <ion-chip (click)="setAmount(1000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹1,000</ion-chip>
                      <ion-chip (click)="setAmount(5000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹5,000</ion-chip>
                      <ion-chip (click)="setAmount(10000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹10,000</ion-chip>
                    </div>

                    <div class="row-actions">
                      <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
                        <ion-icon slot="start" name="send-outline"></ion-icon>
                        {{ loading ? 'Sending...' : 'Send' }}
                      </ion-button>
                    </div>

                    <div class="row-actions success" *ngIf="message">
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      <ion-text color="success">{{ message }}</ion-text>
                    </div>
                    <div class="row-actions error" *ngIf="error">
                      <ion-icon name="information-circle-outline"></ion-icon>
                      <ion-text color="danger">{{ error }}</ion-text>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </form>
      </div>

      <ion-loading [isOpen]="loading" message="Processing..." spinner="bubbles"></ion-loading>
    </ion-content>
  `
})
export class TransferExternalPage implements OnInit {
  ids: number[] = [];
  fromBalance: number | null = null;

  loading = false; message = ''; error = '';

  form = this.fb.group({
    fromAccountId: [null as number | null, Validators.required],
    beneficiaryName: ['', Validators.required],
    beneficiaryBankCode: ['', Validators.required],
    beneficiaryAccountNo: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private reg: AccountRegistryService,
    private accounts: AccountService,
    private auth: AuthService
  ) {
    addIcons({
      logOutOutline, refreshOutline, sendOutline, walletOutline,
      personOutline, businessOutline, informationCircleOutline,
      checkmarkCircleOutline, flashOutline
    });
  }

  ngOnInit() {
    // Load user's accounts and preselect primary
    this.ids = this.reg.list();
    const primary = this.safePrimary();
    const initial = (primary && this.ids.includes(primary)) ? primary : (this.ids[0] ?? null);
    if (initial) {
      this.form.patchValue({ fromAccountId: initial });
      this.loadFromBalance(initial);
    }

    // Coerce numeric field from ion-input (string) -> number/null
    this.coerceNumberControl('amount');

    // Uppercase bank code automatically
    const bc = this.form.get('beneficiaryBankCode');
    bc?.valueChanges.subscribe((v: any) => {
      if (typeof v === 'string') {
        const up = v.toUpperCase();
        if (up !== v) bc.setValue(up, { emitEvent: false });
      }
    });
  }

  private coerceNumberControl(name: 'amount') {
    const ctrl = this.form.get(name) as any;
    ctrl?.valueChanges.subscribe((v: any) => {
      const s = v === null || v === undefined ? '' : String(v);
      const t = s.trim();
      const n = t === '' ? null : Number(t);
      const cur = ctrl.value;
      const change = (n === null && cur !== null) || (n !== null && cur !== n);
      if (change) ctrl.setValue(n, { emitEvent: false });
    });
  }

  private safePrimary(): number | null {
    try {
      const anyReg = this.reg as any;
      if (typeof anyReg.primary === 'function') return Number(anyReg.primary());
      if (typeof anyReg.getPrimary === 'function') return Number(anyReg.getPrimary());
      if (typeof anyReg.primary === 'number') return Number(anyReg.primary);
    } catch {}
    return null;
  }

  onFromChange() {
    const id = Number(this.form.value.fromAccountId);
    if (id) this.loadFromBalance(id);
    else this.fromBalance = null;
  }

  private loadFromBalance(id: number) {
    this.fromBalance = null;
    this.accounts.getAccount(id).subscribe({
      next: (acc) => { this.fromBalance = acc?.balance ?? null; },
      error: () => { this.fromBalance = null; }
    });
  }

  useMax() {
    if (this.fromBalance !== null && this.fromBalance > 0) {
      this.form.patchValue({ amount: Number(this.fromBalance.toFixed(2)) });
    }
  }

  setAmount(v: number) {
    this.form.patchValue({ amount: v });
  }

  submit() {
    this.message = ''; this.error = '';

    const fromAccountId = Number(this.form.value.fromAccountId);
    const amount        = Number(this.form.value.amount);
    const toName        = this.form.value.beneficiaryName || '';
    const toBank        = this.form.value.beneficiaryBankCode || '';
    const toAcc         = this.form.value.beneficiaryAccountNo || '';

    // Client-side checks
    if (!fromAccountId) { this.error = 'Select a source account.'; return; }
    if (!toName || !toBank || !toAcc) { this.error = 'Fill all beneficiary fields.'; return; }
    if (!(amount > 0)) { this.error = 'Amount must be greater than 0.'; return; }
    if (this.fromBalance !== null && amount > this.fromBalance) { this.error = 'Insufficient balance.'; return; }

    const body = {
      externalId: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      fromAccountId,
      beneficiaryName: toName,
      beneficiaryBankCode: toBank,
      beneficiaryAccountNo: toAcc,
      amount
    };

    this.loading = true;
    this.tx.externalTransfer(body).subscribe({
      next: () => {
        this.message = 'Transfer submitted.';
        this.loading = false;

        // Refresh source balance
        this.accounts.getAccount(fromAccountId).subscribe({
          next: (acc) => this.fromBalance = acc?.balance ?? this.fromBalance,
          error: () => {}
        });

        // Optional: clear amount after success
        this.form.patchValue({ amount: null });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || `Transfer failed (${err?.status || 409}).`;
        this.error = String(msg);
        this.loading = false;
      }
    });
  }

  logout() { this.auth.logout?.(); }

  refresh() {
    // Re-pull IDs and balance for currently selected account
    this.ids = this.reg.list();
    const cur = Number(this.form.value.fromAccountId);
    if (cur) this.loadFromBalance(cur);
  }
}

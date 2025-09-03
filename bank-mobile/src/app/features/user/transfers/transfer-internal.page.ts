// src/app/features/user/transfers/transfer-internal.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonList, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonLoading
} from '@ionic/angular/standalone';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';

import { addIcons } from 'ionicons';
import {
  refreshOutline,
  swapHorizontalOutline,
  walletOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  flashOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-transfer-internal',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonList, IonText,
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
        <ion-title>Internal Transfer</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="refresh()" aria-label="Refresh">
            <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="page-container">
        <!-- ✅ form wrapper fixes NG01050 and enables submit -->
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

              <!-- TO account -->
              <ion-col size="12" sizeMd="6">
                <ion-card class="card">
                  <ion-card-header>
                    <ion-card-title>
                      <ion-icon name="swap-horizontal-outline"></ion-icon>
                      &nbsp;To Account (within bank)
                    </ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Account ID</ion-label>
                        <ion-input type="number" inputmode="numeric" formControlName="toAccountId" placeholder="e.g. 1002"></ion-input>
                      </ion-item>
                    </ion-list>

                    <div class="chips">
                      <ion-chip (click)="swapIfOwn()">Swap with selected From</ion-chip>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>

              <!-- AMOUNT & SUBMIT -->
              <ion-col size="12">
                <ion-card class="card">
                  <ion-card-header>
                    <ion-card-title>Amount</ion-card-title>
                  </ion-card-header>
                  <ion-card-content>
                    <ion-list lines="inset">
                      <ion-item>
                        <ion-label position="stacked">Amount</ion-label>
                        <ion-input
                          type="number" inputmode="decimal" placeholder="e.g. 1000"
                          formControlName="amount"></ion-input>
                      </ion-item>
                    </ion-list>

                    <div class="chips">
                      <ion-chip (click)="setAmount(500)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹500</ion-chip>
                      <ion-chip (click)="setAmount(1000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹1,000</ion-chip>
                      <ion-chip (click)="setAmount(5000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹5,000</ion-chip>
                      <ion-chip (click)="setAmount(10000)"><ion-icon name="flash-outline"></ion-icon>&nbsp;₹10,000</ion-chip>
                    </div>

                    <div class="row-actions">
                      <!-- ✅ submit triggers (ngSubmit) -->
                      <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
                        <ion-icon slot="start" name="swap-horizontal-outline"></ion-icon>
                        {{ loading ? 'Transferring...' : 'Transfer' }}
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
export class TransferInternalPage implements OnInit {
  ids: number[] = [];
  fromBalance: number | null = null;
  loading = false;
  message = '';
  error = '';

  form = this.fb.group({
    fromAccountId: [null as number | null, Validators.required],
    toAccountId:   [null as number | null, Validators.required],
    amount:        [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private accounts: AccountService,
    private reg: AccountRegistryService
  ) {
    addIcons({
      refreshOutline, swapHorizontalOutline, walletOutline,
      checkmarkCircleOutline, informationCircleOutline, flashOutline
    });
  }

  ngOnInit() {
    this.ids = this.reg.list();

    // Prefer primary account if available
    const primary = this.safePrimary();
    if (primary && this.ids.includes(primary)) {
      this.form.patchValue({ fromAccountId: primary });
      this.loadFromBalance(primary);
    } else if (this.ids.length) {
      const first = this.ids[0];
      this.form.patchValue({ fromAccountId: first });
      this.loadFromBalance(first);
    }

    // ✅ Coerce string/number to the proper numeric/null value without .trim() type issues
    this.coerceNumberControl('amount');
    this.coerceNumberControl('toAccountId');
  }

  private coerceNumberControl(name: 'amount' | 'toAccountId') {
    const ctrl = this.form.get(name) as any; // cast to relax TS typed-forms narrowing
    ctrl?.valueChanges.subscribe((v: any) => {
      // Convert v to string safely, then to number/null
      const s = v === null || v === undefined ? '' : String(v);
      const t = s.trim();
      const n = t === '' ? null : Number(t);
      // Only set when necessary to avoid loops
      const current = ctrl.value;
      const shouldChange =
        (n === null && current !== null) ||
        (n !== null && current !== n);
      if (shouldChange) ctrl.setValue(n, { emitEvent: false });
    });
  }

  refresh() {
    this.ids = this.reg.list();
    const cur = Number(this.form.value.fromAccountId);
    if (cur) this.loadFromBalance(cur);
  }

  onFromChange() {
    const id = Number(this.form.value.fromAccountId);
    if (id) this.loadFromBalance(id);
    else this.fromBalance = null;
  }

  private loadFromBalance(id: number) {
    this.fromBalance = null; // show skeleton
    this.accounts.getAccount(id).subscribe({
      next: (acc) => { this.fromBalance = acc?.balance ?? null; },
      error: () => { this.fromBalance = null; }
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

  useMax() {
    if (this.fromBalance !== null && this.fromBalance > 0) {
      this.form.patchValue({ amount: Number(this.fromBalance.toFixed(2)) });
    }
  }

  setAmount(v: number) { this.form.patchValue({ amount: v }); }

  swapIfOwn() {
    const fromId = Number(this.form.value.fromAccountId);
    const toId = Number(this.form.value.toAccountId);
    if (!fromId) return;
    if (toId && this.ids.includes(toId)) {
      this.form.patchValue({ fromAccountId: toId, toAccountId: fromId });
      this.onFromChange();
    }
  }

  submit() {
    this.message = '';
    this.error = '';

    const fromAccountId = Number(this.form.value.fromAccountId);
    const toAccountId   = Number(this.form.value.toAccountId);
    const amount        = Number(this.form.value.amount);

    // Client-side validation
    if (!fromAccountId || !toAccountId) { this.error = 'Please choose both accounts.'; return; }
    if (fromAccountId === toAccountId) { this.error = 'From/To accounts must be different.'; return; }
    if (!(amount > 0)) { this.error = 'Amount must be greater than 0.'; return; }
    if (this.fromBalance !== null && amount > this.fromBalance) { this.error = 'Insufficient balance.'; return; }

    const body = {
      externalId: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      fromAccountId, toAccountId, amount
    };

    this.loading = true;
    this.tx.internalTransfer(body).subscribe({
      next: () => {
        this.message = 'Transfer successful.';
        this.loading = false;

        // Refresh balance for "from" account
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
}

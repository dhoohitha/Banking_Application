import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonList, IonText, IonButton
} from '@ionic/angular/standalone';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';

@Component({
  standalone: true,
  selector: 'app-transfer-internal',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonList, IonText, IonButton
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Internal Transfer</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="submit()">
    <ion-list>

      <ion-item>
        <ion-label position="stacked">From Account</ion-label>
        <ion-select formControlName="fromAccountId" (ionChange)="onFromChange()">
          <ion-select-option *ngFor="let id of ids" [value]="id">{{ id }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item *ngIf="fromBalance !== null">
        <ion-label>Current Balance</ion-label>
        <ion-text>{{ fromBalance | number:'1.2-2' }}</ion-text>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">To Account (within bank)</ion-label>
        <ion-input type="number" formControlName="toAccountId" placeholder="e.g. 1002"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Amount</ion-label>
        <ion-input type="number" formControlName="amount" placeholder="e.g. 1000"></ion-input>
      </ion-item>

    </ion-list>

    <div class="ion-padding-top">
      <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
        {{ loading ? 'Transferring...' : 'Transfer' }}
      </ion-button>
    </div>

    <div class="ion-padding-top">
      <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
      <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
    </div>
  </form>
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
    toAccountId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private accounts: AccountService,
    private reg: AccountRegistryService
  ) {}

  ngOnInit() {
    this.ids = this.reg.list();
    // default to primary if available
    const primary = this.reg.primary();
    if (primary && this.ids.includes(primary)) {
      this.form.patchValue({ fromAccountId: primary });
      this.loadFromBalance(primary);
    } else if (this.ids.length) {
      this.form.patchValue({ fromAccountId: this.ids[0] });
      this.loadFromBalance(this.ids[0]);
    }
  }

  onFromChange() {
    const id = Number(this.form.value.fromAccountId);
    if (id) {
      this.loadFromBalance(id);
    } else {
      this.fromBalance = null;
    }
  }

  private loadFromBalance(id: number) {
    this.fromBalance = null;
    this.accounts.getAccount(id).subscribe({
      next: (acc) => { this.fromBalance = acc?.balance ?? null; },
      error: () => { this.fromBalance = null; }
    });
  }

  submit() {
    this.message = '';
    this.error = '';

    const fromAccountId = Number(this.form.value.fromAccountId);
    const toAccountId = Number(this.form.value.toAccountId);
    const amount = Number(this.form.value.amount);

    // Client-side validation to avoid common 409s
    if (!fromAccountId || !toAccountId) { this.error = 'Please choose both accounts.'; return; }
    if (fromAccountId === toAccountId) { this.error = 'From/To accounts must be different.'; return; }
    if (!(amount > 0)) { this.error = 'Amount must be greater than 0.'; return; }
    if (this.fromBalance !== null && amount > this.fromBalance) {
      this.error = 'Insufficient balance.'; return;
    }

    const body = {
      externalId: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      fromAccountId,
      toAccountId,
      amount
    };

    this.loading = true;
    this.tx.internalTransfer(body).subscribe({
      next: () => {
        this.message = 'Transfer successful.';
        this.loading = false;

        // Refresh balances for both accounts to reflect the new state
        this.accounts.getAccount(fromAccountId).subscribe({
          next: (acc) => this.fromBalance = acc?.balance ?? this.fromBalance,
          error: () => {}
        });

        // If the destination belongs to you and is tracked, refresh it too (optional)
        if (this.ids.includes(toAccountId)) {
          this.accounts.getAccount(toAccountId).subscribe({ next: () => {}, error: () => {} });
        }
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || `Transfer failed (${err?.status || 409}).`;
        this.error = String(msg);
        this.loading = false;
      }
    });
  }
}

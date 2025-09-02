import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonList, IonText
} from '@ionic/angular/standalone';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-transfer-external',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonList, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>External Transfer</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="submit()">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">From Account</ion-label>
        <ion-select formControlName="fromAccountId">
          <ion-select-option *ngFor="let id of ids" [value]="id">{{ id }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Beneficiary Name</ion-label>
        <ion-input formControlName="beneficiaryName"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Bank Code</ion-label>
        <ion-input formControlName="beneficiaryBankCode" placeholder="HDFC"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Account No.</ion-label>
        <ion-input formControlName="beneficiaryAccountNo"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Amount</ion-label>
        <ion-input type="number" formControlName="amount"></ion-input>
      </ion-item>
    </ion-list>

    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
      {{ loading ? 'Sending...' : 'Send' }}
    </ion-button>

    <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
    <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
  </form>
</ion-content>
`})
export class TransferExternalPage {
  ids: number[] = this.reg.list();
  loading = false; message = ''; error = '';

  form = this.fb.group({
    fromAccountId: [this.reg.primary(), Validators.required],
    beneficiaryName: ['', Validators.required],
    beneficiaryBankCode: ['', Validators.required],
    beneficiaryAccountNo: ['', Validators.required],
    amount: [null as any, [Validators.required, Validators.min(0.01)]],
  });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) { addIcons({ logOutOutline }); }

  submit() {
    const body = {
      externalId: 'tx' + Date.now(),
      fromAccountId: Number(this.form.value.fromAccountId),
      beneficiaryName: this.form.value.beneficiaryName!,
      beneficiaryBankCode: this.form.value.beneficiaryBankCode!,
      beneficiaryAccountNo: this.form.value.beneficiaryAccountNo!,
      amount: Number(this.form.value.amount)
    };
    this.loading = true; this.error = ''; this.message = '';
    this.tx.externalTransfer(body).subscribe({
      next: () => { this.message = 'Transfer submitted.'; this.loading = false; },
      error: () => { this.error = 'Transfer failed.'; this.loading = false; }
    });
  }

  logout() { this.auth.logout(); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText
} from '@ionic/angular/standalone';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { addIcons } from 'ionicons';
import { logOutOutline, refreshOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tx-history',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Transaction History</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="load()">
    <ion-item>
      <ion-label position="stacked">Account</ion-label>
      <ion-select formControlName="accountId">
        <ion-select-option *ngFor="let id of ids" [value]="id">{{ id }}</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-button type="submit" fill="outline" size="small">
      <ion-icon name="refresh-outline" slot="start"></ion-icon>
      Load
    </ion-button>
  </form>

  <ion-list *ngIf="rows.length; else empty">
    <ion-item *ngFor="let r of rows">
      <ion-label>
        <h2>{{ r.ts | date:'medium' }} — {{ r.type }}</h2>
        <p>Amount: {{ r.amount | number:'1.2-2' }} • Running: {{ r.runningBalance | number:'1.2-2' }}</p>
        <p *ngIf="r.description">{{ r.description }}</p>
      </ion-label>
    </ion-item>
  </ion-list>

  <ng-template #empty>
    <ion-text>Nothing yet. Load an account.</ion-text>
  </ng-template>
</ion-content>
`})
export class TxHistoryPage {
  ids = this.reg.list();
  rows: any[] = [];
  form = this.fb.group({ accountId: [this.reg.primary(), Validators.required] });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) { addIcons({ logOutOutline, refreshOutline }); }

  load() {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;
    this.tx.history(accountId).subscribe({
      next: res => this.rows = res || [],
      error: () => this.rows = []
    });
  }

  logout() { this.auth.logout(); }
}

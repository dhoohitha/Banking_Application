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
import { logOutOutline, downloadOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-tx-statement',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Statement</ion-title>
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

    <div class="ion-padding-top">
      <ion-button type="submit" fill="outline">Load</ion-button>
      <ion-button fill="solid" color="primary" (click)="exportCsv()" [disabled]="!form.value.accountId">
        <ion-icon name="download-outline" slot="start"></ion-icon>
        Export CSV
      </ion-button>
    </div>
  </form>

  <ion-list *ngIf="rows.length; else empty">
    <ion-item *ngFor="let r of rows">
      <ion-label>
        <h2>{{ r.ts | date:'medium' }} — {{ r.type }} — {{ r.status || 'OK' }}</h2>
        <p>Amount: {{ r.amount | number:'1.2-2' }}</p>
      </ion-label>
    </ion-item>
  </ion-list>

  <div class="ion-padding-top" *ngIf="hasMore">
    <ion-button (click)="next()">Load more</ion-button>
  </div>

  <ng-template #empty>
    <ion-text>No records. Load an account.</ion-text>
  </ng-template>
</ion-content>
`})
export class TxStatementPage {
  ids = this.reg.list();
  rows: any[] = [];
  page = 0; size = 10; hasMore = false;

  form = this.fb.group({ accountId: [this.reg.primary(), Validators.required] });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) { addIcons({ logOutOutline, downloadOutline }); }

  load() {
    this.page = 0; this.rows = [];
    this.fetch();
  }

  next() {
    if (this.hasMore) { this.page++; this.fetch(true); }
  }

  private fetch(append = false) {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;
    this.tx.statement(accountId, this.page, this.size).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
        this.hasMore = !!res?.totalPages ? (this.page + 1 < res.totalPages) : false;
        this.rows = append ? [...this.rows, ...items] : items;
      },
      error: () => { this.rows = []; this.hasMore = false; }
    });
  }

  exportCsv() {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;
    this.tx.exportCsv(accountId).subscribe({
      next: (blob: any) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `statement_${accountId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {}
    });
  }

  logout() { this.auth.logout(); }
}

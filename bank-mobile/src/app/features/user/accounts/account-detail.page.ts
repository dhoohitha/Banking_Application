import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonList, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-account-detail',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonList, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Account #{{ id }}</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-card>
    <ion-card-header><ion-card-title>Details</ion-card-title></ion-card-header>
    <ion-card-content>
      <p *ngIf="balance !== null">Balance: {{ balance | number:'1.2-2' }}</p>
      <p *ngIf="balance === null">Loading...</p>
    </ion-card-content>
  </ion-card>

  <ion-list>
    <ion-item>
      <ion-label position="stacked">Amount</ion-label>
      <ion-input type="number" [formControl]="amount"></ion-input>
    </ion-item>
  </ion-list>
  <div class="ion-padding-top">
    <ion-button (click)="credit()" [disabled]="amount.invalid">Credit</ion-button>
    <ion-button color="danger" (click)="debit()" [disabled]="amount.invalid">Debit</ion-button>
  </div>

  <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
  <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
</ion-content>
`})
export class AccountDetailPage {
  id = Number(this.route.snapshot.paramMap.get('id'));
  balance: number | null = null;
  message = ''; error = '';
  amount = this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]);

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private account: AccountService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) {
    addIcons({ logOutOutline });
    this.reg.add(this.id);
    this.load();
  }

  load() {
    this.account.getAccount(this.id).subscribe({
      next: acc => this.balance = acc.balance,
      error: () => { this.error = 'Could not load account'; }
    });
  }

  credit() {
    const amt = Number(this.amount.value || 0);
    this.account.credit(this.id, amt).subscribe({
      next: () => { this.message = 'Credited'; this.load(); },
      error: () => { this.error = 'Credit failed'; }
    });
  }

  debit() {
    const amt = Number(this.amount.value || 0);
    this.account.debit(this.id, amt).subscribe({
      next: () => { this.message = 'Debited'; this.load(); },
      error: () => { this.error = 'Debit failed'; }
    });
  }

  logout() { this.auth.logout(); }
}

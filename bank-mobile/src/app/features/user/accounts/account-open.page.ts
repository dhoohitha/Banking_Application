import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText
} from '@ionic/angular/standalone';
import { AccountService } from '../../../core/services/account.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-account-open',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Open Account</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="open()">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Account Type</ion-label>
        <ion-select formControlName="type">
          <ion-select-option value="SAVINGS">SAVINGS</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>
    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
      {{ loading ? 'Opening...' : 'Open Account' }}
    </ion-button>
    <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
    <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>
  </form>
</ion-content>
`})
export class AccountOpenPage {
  loading = false; message = ''; error = '';
  form = this.fb.group({ type: ['SAVINGS', Validators.required] });

  constructor(
    private fb: FormBuilder,
    private account: AccountService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) { addIcons({ logOutOutline }); }

  open() {
    const customerId = Number(localStorage.getItem('customerId') || 0);
    if (!customerId) { this.error = 'Create profile (customer) first.'; return; }
    this.loading = true; this.error = ''; this.message = '';
    this.account.openAccount({ customerId, type: this.form.value.type as any }).subscribe({
      next: (res: any) => {
        const newId = Number(res?.id || res); // backend might return id or object
        if (newId) this.reg.add(newId);
        this.message = `Account opened. ID: ${newId ?? '(check details)'}`;
        this.loading = false;
      },
      error: (e) => { this.error = 'Failed to open account.'; this.loading = false; }
    });
  }

  logout() { this.auth.logout(); }
}

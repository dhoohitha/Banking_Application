// kyc.page.ts
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ gives NgIf/NgFor
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonList, IonText
} from '@ionic/angular/standalone';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  standalone: true,
  selector: 'app-kyc',
  imports: [
    CommonModule,             // ✅ add this
    ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonButton, IonList, IonText
  ],
  template: `
<ion-header><ion-toolbar><ion-title>KYC</ion-title></ion-toolbar></ion-header>
<ion-content class="ion-padding">
  <form [formGroup]="form" (ngSubmit)="submit()">
    <ion-list>
      <ion-item>
        <ion-label position="stacked">Document Type</ion-label>
        <ion-select formControlName="docType">
          <ion-select-option value="PAN">PAN</ion-select-option>
          <ion-select-option value="AADHAAR">AADHAAR</ion-select-option>
          <ion-select-option value="PASSPORT">PASSPORT</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Document URL</ion-label>
        <ion-input formControlName="docUrl" placeholder="https://..."></ion-input>
      </ion-item>
    </ion-list>

    <ion-button expand="block" type="submit" [disabled]="form.invalid || loading">
      {{ loading ? 'Submitting...' : 'Upload KYC' }}
    </ion-button>

    <!-- ✅ wrap structural directives on web components -->
    <ng-container *ngIf="message">
      <ion-text color="success">{{ message }}</ion-text>
    </ng-container>
    <ng-container *ngIf="error">
      <ion-text color="danger">{{ error }}</ion-text>
    </ng-container>
  </form>
</ion-content>
`})
export class KycPage {
  loading = false; message = ''; error = '';
  customerId = Number(localStorage.getItem('customerId') || 0);
  form = this.fb.group({ docType: ['PAN', Validators.required], docUrl: ['', Validators.required] });

  constructor(private fb: FormBuilder, private cs: CustomerService) {}

  submit() {
    if (!this.customerId) { this.error = 'Create profile first.'; return; }
    this.loading = true; this.error = ''; this.message = '';
    this.cs.uploadKyc(this.customerId, this.form.value as any).subscribe({
      next: () => { this.message = 'KYC submitted (PENDING).'; this.loading = false; },
      error: () => { this.error = 'Failed to upload.'; this.loading = false; }
    });
  }
}

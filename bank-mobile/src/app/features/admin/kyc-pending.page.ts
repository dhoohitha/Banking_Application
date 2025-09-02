// src/app/features/admin/kyc-pending.page.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { CustomerResponse } from '../../core/models/bank.models';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton, IonText
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-kyc-pending',
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonButton, IonText],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<ion-header><ion-toolbar><ion-title>Pending KYC</ion-title></ion-toolbar></ion-header>
<ion-content class="ion-padding">
  <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>

  <ion-list *ngIf="customers.length; else empty">
    <ion-item *ngFor="let c of customers" (click)="open(c.id)">
      <ion-label>
        <h2>{{ c.fullName || c.email }}</h2>
        <p>{{ c.email }} • ID: {{ c.id }}</p>
      </ion-label>
      <ion-button slot="end" (click)="open(c.id); $event.stopPropagation();">Review</ion-button>
    </ion-item>
  </ion-list>

  <ng-template #empty>
    <ion-text>No pending KYCs found.</ion-text>
    <pre *ngIf="debugJson" style="white-space: pre-wrap; font-size:12px; background:#111; color:#9ef; padding:8px; border-radius:6px; margin-top:8px;">
{{ debugJson }}
    </pre>
  </ng-template>

  <ion-button expand="block" (click)="loadMore()" *ngIf="page+1 < totalPages">Load more</ion-button>
  <ion-button expand="block" fill="outline" (click)="refresh()">Refresh</ion-button>
</ion-content>
`})
export class KycPendingPage implements OnInit {
  customers: CustomerResponse[] = [];
  page = 0; totalPages = 1;
  error = '';
  debugJson = '';

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit() { this.fetch(); }

  fetch() {
    this.error = '';
    this.admin.listPending('PENDING', this.page, 10).subscribe({
      next: (res) => {
        this.customers = [...this.customers, ...res.items];
        this.totalPages = res.totalPages;
        if (!this.customers.length) {
          this.debugJson = '(See console for raw response)'; // real raw is logged in AdminService
        } else {
          this.debugJson = '';
        }
      },
      error: (err) => {
        console.error('KYC list failed', err);
        this.error = err?.error?.message || `Failed to load pending KYCs (status ${err.status || 'unknown'})`;
      }
    });
  }

  refresh() {
    this.page = 0; this.totalPages = 1; this.customers = []; this.debugJson = '';
    this.fetch();
  }

  loadMore() {
    if (this.page + 1 < this.totalPages) { this.page++; this.fetch(); }
  }

  open(id: number) { this.router.navigate(['/admin/kyc', id]); }
}

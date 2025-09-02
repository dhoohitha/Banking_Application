// src/app/features/admin/kyc-detail.page.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';   // ✅ add this
import { AdminService } from '../../core/services/admin.service';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerResponse } from '../../core/models/bank.models';
import { AuthService } from '../../core/services/auth.service';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonText, IonList, IonItem, IonLabel, IonButton
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-kyc-detail',
  imports: [
    CommonModule,             // ✅ gives *ngIf, *ngFor
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonText, IonList, IonItem, IonLabel, IonButton
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>KYC Review</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <!-- safer: use ng-container with *ngIf -->
  <ng-container *ngIf="c">
    <h2>{{ c.fullName || c.email }}</h2>
    <p>{{ c.email }} • Phone: {{ c.phone }}</p>

    <h3 class="ion-padding-top">Documents</h3>
    <ion-list>
      <ion-item *ngFor="let d of c.docs">
        <ion-label>
          <h2>{{ d.docType }}</h2>
          <p><a [href]="d.docUrl" target="_blank">{{ d.docUrl }}</a></p>
        </ion-label>
      </ion-item>
    </ion-list>

    <div class="ion-padding-top">
      <ion-button color="success" (click)="approve()">Approve</ion-button>
      <ion-button color="danger" (click)="reject()">Reject</ion-button>
    </div>
    <ion-text color="success" *ngIf="message">{{ message }}</ion-text>
  </ng-container>
</ion-content>
`})
export class KycDetailPage implements OnInit {
  c!: CustomerResponse; message = '';
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private admin: AdminService,
    private customer: CustomerService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('customerId'));
    this.customer.getProfile(this.id).subscribe(res => this.c = res);
  }

  approve() {
    this.admin.approve(this.id, this.auth.getEmail() || 'admin@bank.test')
      .subscribe(() => this.message = 'Approved.');
  }

  reject() {
    const reason = prompt('Reason for rejection?') || 'Insufficient quality';
    this.admin.reject(this.id, this.auth.getEmail() || 'admin@bank.test', reason)
      .subscribe(() => this.message = 'Rejected.');
  }
}

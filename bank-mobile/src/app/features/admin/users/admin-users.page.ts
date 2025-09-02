// src/app/features/admin/users/admin-users.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonButton, IonButtons, IonIcon, IonText
} from '@ionic/angular/standalone';
import { AdminService } from '../../../core/services/admin.service';
import { CustomerResponse } from '../../../core/models/bank.models';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline, refreshOutline } from 'ionicons/icons';

type KycTab = 'PENDING' | 'APPROVED' | 'REJECTED';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItem, IonButton, IonButtons, IonIcon, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Users (by KYC Status)</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon name="log-out-outline" slot="icon-only"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-segment [(ngModel)]="tab" (ionChange)="refresh()">
    <ion-segment-button value="PENDING"><ion-label>PENDING</ion-label></ion-segment-button>
    <ion-segment-button value="APPROVED"><ion-label>APPROVED</ion-label></ion-segment-button>
    <ion-segment-button value="REJECTED"><ion-label>REJECTED</ion-label></ion-segment-button>
  </ion-segment>

  <div class="ion-padding-top">
    <ion-button fill="outline" size="small" (click)="refresh()">
      <ion-icon name="refresh-outline" slot="start"></ion-icon>Refresh
    </ion-button>
  </div>

  <ion-text color="danger" *ngIf="error">{{ error }}</ion-text>

  <ion-list *ngIf="users.length; else empty">
    <ion-item *ngFor="let u of users" (click)="open(u.id)">
      <ion-label>
        <h2>{{ u.fullName || u.email }}</h2>
        <p>{{ u.email }} • ID: {{ u.id }}</p>
      </ion-label>
      <ion-button slot="end" (click)="open(u.id); $event.stopPropagation();">Open</ion-button>
    </ion-item>
  </ion-list>

  <ng-template #empty>
    <ion-text>No users in {{ tab }} state.</ion-text>
  </ng-template>

  <div class="ion-padding-top" *ngIf="page+1 < totalPages">
    <ion-button (click)="loadMore()">Load more</ion-button>
  </div>
</ion-content>
`})
export class AdminUsersPage implements OnInit {
  tab: KycTab = 'PENDING';
  users: CustomerResponse[] = [];
  page = 0; totalPages = 1; error = '';

  constructor(private admin: AdminService, private router: Router, private auth: AuthService) {
    addIcons({ logOutOutline, refreshOutline });
  }

  ngOnInit() { this.refresh(); }

  refresh() {
    this.page = 0; this.totalPages = 1; this.users = []; this.error = '';
    this.fetch();
  }

  loadMore() {
    if (this.page + 1 < this.totalPages) { this.page++; this.fetch(); }
  }

  private fetch() {
    this.admin.listPending(this.tab, this.page, 10).subscribe({
      next: res => {
        this.users = [...this.users, ...res.items];
        this.totalPages = res.totalPages || 1;
      },
      error: err => this.error = err?.error?.message || 'Failed to load users'
    });
  }

  open(id: number) { this.router.navigate(['/admin/kyc', id]); }
  logout() { this.auth.logout(); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonRouterOutlet
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-user-tabs',
  imports: [
    CommonModule,
    RouterModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    IonRouterOutlet
  ],
  template: `
<ion-tabs>
  <!-- Route content renders here -->
  <ion-router-outlet></ion-router-outlet>

  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="dashboard" [routerLink]="['/user/dashboard']">
      <ion-label>Home</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="accounts" [routerLink]="['/user/accounts']">
      <ion-label>Accounts</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="transfer" [routerLink]="['/user/transfer/internal']">
      <ion-label>Transfer</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="tx" [routerLink]="['/user/transactions/history']">
      <ion-label>History</ion-label>
    </ion-tab-button>

    <!-- ✅ New tab for Statements -->
    <ion-tab-button tab="statement" [routerLink]="['/user/transactions/statement']">
      <ion-label>Statements</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="profile" [routerLink]="['/user/profile']">
      <ion-label>Profile</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</ion-tabs>
`
})
export class UserTabsPage {}

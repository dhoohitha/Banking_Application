import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel,
  IonButton, IonButtons, IonIcon, IonText
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel,
    IonButton, IonButtons, IonIcon, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Dashboard</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-card>
    <ion-card-header><ion-card-title>Welcome</ion-card-title></ion-card-header>
    <ion-card-content>
      <p>Email: {{ email }}</p>

      <ion-list inset class="ion-margin-top">
        <ion-item button detail (click)="go('/user/profile')"><ion-label>Profile</ion-label></ion-item>
        <ion-item button detail (click)="go('/user/kyc')"><ion-label>KYC</ion-label></ion-item>
      </ion-list>

      <ion-list inset class="ion-margin-top">
        <ion-item button detail (click)="go('/user/accounts')"><ion-label>My Accounts</ion-label></ion-item>
        <ion-item button detail (click)="go('/user/accounts/open')"><ion-label>Open Account</ion-label></ion-item>
      </ion-list>

      <ion-list inset class="ion-margin-top">
        <ion-item button detail (click)="go('/user/transfer/internal')"><ion-label>Internal Transfer</ion-label></ion-item>
        <ion-item button detail (click)="go('/user/transfer/external')"><ion-label>External Transfer</ion-label></ion-item>
      </ion-list>

      <ion-list inset class="ion-margin-top">
        <ion-item button detail (click)="go('/user/transactions/history')"><ion-label>Transaction History</ion-label></ion-item>
        <ion-item button detail (click)="go('/user/transactions/statement')"><ion-label>Statements</ion-label></ion-item>
      </ion-list>

      <ion-text color="medium" class="ion-margin-top" *ngIf="lastTap">
        Last tap: {{ lastTap }}
      </ion-text>
    </ion-card-content>
  </ion-card>
</ion-content>
`
})
export class UserDashboardPage {
  email = this.auth.getEmail() || '';
  lastTap = '';
  constructor(private auth: AuthService, private router: Router) { addIcons({ logOutOutline }); }
  go(path: string) { this.lastTap = path; this.router.navigateByUrl(path); }
  logout() { this.auth.logout(); }
}

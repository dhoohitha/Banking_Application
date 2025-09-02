import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonText
} from '@ionic/angular/standalone';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AccountService } from '../../../core/services/account.service';
import { addIcons } from 'ionicons';
import { addCircleOutline, refreshOutline, logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [
    CommonModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonList, IonItem, IonLabel, IonText
  ],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>My Accounts</ion-title>
    <ion-buttons slot="end">
      <ion-button routerLink="/user/accounts/open">
        <ion-icon slot="icon-only" name="add-circle-outline"></ion-icon>
      </ion-button>
      <ion-button (click)="logout()">
        <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-button fill="outline" size="small" (click)="refresh()">
    <ion-icon name="refresh-outline" slot="start"></ion-icon>
    Refresh
  </ion-button>

  <ion-text *ngIf="!ids.length">No accounts yet. Open one.</ion-text>

  <ion-list *ngIf="ids.length">
    <ion-item *ngFor="let id of ids" [routerLink]="['/user/accounts', id]">
      <ion-label>
        <h2>Account #{{ id }}</h2>
        <p *ngIf="balances[id] !== undefined">Balance: {{ balances[id] | number:'1.2-2' }}</p>
        <p *ngIf="balances[id] === undefined">Tap to view</p>
      </ion-label>
      <ion-button slot="end" fill="clear" (click)="setPrimary(id); $event.stopPropagation()">
        Set Primary
      </ion-button>
    </ion-item>
  </ion-list>
</ion-content>
`})
export class AccountsPage {
  ids: number[] = [];
  balances: Record<number, number> = {};

  constructor(
    private reg: AccountRegistryService,
    private account: AccountService,
    private auth: AuthService
  ) {
    addIcons({ addCircleOutline, refreshOutline, logOutOutline });
    this.refresh();
  }

  refresh() {
    this.ids = this.reg.list();
    // optionally fetch balances for known IDs
    this.ids.forEach(id => {
      this.account.getAccount(id).subscribe({
        next: acc => this.balances[id] = acc.balance,
        error: () => {}
      });
    });
  }

  setPrimary(id: number) { this.reg.setPrimary(id); }
  logout() { this.auth.logout(); }
}

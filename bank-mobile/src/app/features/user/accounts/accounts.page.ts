import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonGrid, IonRow, IonCol,
  IonCard, IonCardContent,
  IonChip, IonText, IonSkeletonText
} from '@ionic/angular/standalone';

import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  addCircleOutline, refreshOutline, logOutOutline,
  walletOutline, star, starOutline, arrowForwardOutline, informationCircleOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonChip, IonText, IonSkeletonText
  ],
  styles: [`
    /* Header gradient to match your app */
    .gradient-toolbar {
      --background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: #fff;
    }

    ion-content {
      --padding-start: clamp(12px, 3vw, 20px);
      --padding-end: clamp(12px, 3vw, 20px);
      --padding-top: clamp(12px, 2.4vw, 16px);
      --padding-bottom: clamp(18px, 3.2vw, 28px);
    }

    .page-container {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
    }

    /* Top action row */
    .action-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 6px 0 16px;
    }

    /* Account cards */
    .account-card {
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.10);
      transition: transform .12s ease, box-shadow .12s ease;
      cursor: pointer;
      background: #fff;
    }
    .account-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.14);
    }

    .acct-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .acct-title {
      font-weight: 800;
      letter-spacing: .2px;
    }
    .spacer { flex: 1; }

    .wallet-icon {
      font-size: 28px;
      color: var(--ion-color-primary);
    }

    .balance-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      min-height: 28px;
    }
    .balance-label {
      color: var(--ion-color-medium);
      font-size: 12px;
      letter-spacing: .3px;
    }
    .balance-value {
      font-size: clamp(18px, 3.6vw, 22px);
      font-weight: 800;
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 14px;
    }
    .chip-primary {
      background: linear-gradient(90deg,#6a11cb,#2575fc);
      color: #fff;
      font-weight: 700;
    }

    /* Empty state */
    .empty {
      display: grid;
      place-items: center;
      text-align: center;
      padding: 36px 12px 8px;
      color: var(--ion-color-medium);
    }
    .empty .big-icon {
      font-size: 64px;
      color: var(--ion-color-primary);
      opacity: .85;
      margin-bottom: 8px;
    }
    .empty h3 {
      margin: 8px 0 6px;
      font-weight: 800;
    }
    .empty p {
      margin: 0 0 16px;
      font-size: 13px;
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>My Accounts</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/user/accounts/open" aria-label="Open account">
            <ion-icon slot="icon-only" name="add-circle-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="page-container">
        <div class="action-row">
          <ion-button fill="outline" size="small" (click)="refresh()">
            <ion-icon name="refresh-outline" slot="start"></ion-icon>
            Refresh
          </ion-button>
          <ion-button routerLink="/user/accounts/open" size="small">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            Open Account
          </ion-button>
        </div>

        <!-- Empty state -->
        <div *ngIf="!ids.length" class="empty">
          <ion-icon class="big-icon" name="information-circle-outline"></ion-icon>
          <h3>No accounts yet</h3>
          <p>Create your first account to get started.</p>
          <ion-button routerLink="/user/accounts/open">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            Open Account
          </ion-button>
        </div>

        <!-- Accounts grid -->
        <ion-grid fixed *ngIf="ids.length">
          <ion-row>
            <ion-col size="12" sizeSm="6" sizeMd="4" *ngFor="let id of ids">
              <ion-card class="account-card" (click)="goTo(id)">
                <ion-card-content>
                  <div class="acct-header">
                    <ion-icon class="wallet-icon" name="wallet-outline"></ion-icon>
                    <div>
                      <div class="acct-title">Account #{{ id }}</div>
                      <div class="balance-label">Tap to view details</div>
                    </div>
                    <div class="spacer"></div>

                    <!-- Primary chip -->
                    <ion-chip *ngIf="isPrimary(id)" class="chip-primary" outline="false">
                      <ion-icon name="star"></ion-icon>
                      <ion-text>&nbsp;Primary</ion-text>
                    </ion-chip>
                  </div>

                  <!-- Balance -->
                  <div class="balance-row">
                    <div class="balance-label">Balance</div>
                    <div class="balance-value" *ngIf="balances[id] !== undefined">
                      {{ balances[id] | number:'1.2-2' }}
                    </div>
                    <ion-skeleton-text
                      *ngIf="balances[id] === undefined"
                      [animated]="true" style="width: 120px; height: 18px;">
                    </ion-skeleton-text>
                  </div>

                  <!-- Actions -->
                  <div class="card-actions" (click)="$event.stopPropagation()">
                    <ion-button fill="clear" size="small" (click)="goTo(id)">
                      View
                      <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
                    </ion-button>

                    <ion-button fill="clear" size="small" (click)="setPrimary(id)">
                      <ion-icon [name]="isPrimary(id) ? 'star' : 'star-outline'" slot="start"></ion-icon>
                      {{ isPrimary(id) ? 'Primary' : 'Set Primary' }}
                    </ion-button>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

      </div>
    </ion-content>
  `
})
export class AccountsPage {
  ids: number[] = [];
  balances: Record<number, number> = {};

  constructor(
    private reg: AccountRegistryService,
    private account: AccountService,
    private auth: AuthService,
    private router: Router
  ) {
    addIcons({
      addCircleOutline, refreshOutline, logOutOutline,
      walletOutline, star, starOutline, arrowForwardOutline, informationCircleOutline
    });
    this.refresh();
  }

  refresh() {
    this.ids = this.reg.list();
    // Clear stale balances before reloading (keeps skeletons visible)
    this.balances = {};
    this.ids.forEach(id => {
      this.account.getAccount(id).subscribe({
        next: acc => this.balances[id] = acc?.balance,
        error: () => { /* keep skeleton if error */ }
      });
    });
  }

  goTo(id: number) {
    this.router.navigate(['/user/accounts', id]);
  }

  isPrimary(id: number): boolean {
    // Handle both: registry may or may not expose isPrimary/primary getters
    try {
      const anyReg = this.reg as any;
      if (typeof anyReg.isPrimary === 'function') return !!anyReg.isPrimary(id);
      if (typeof anyReg.getPrimary === 'function') return anyReg.getPrimary() === id;
      if (typeof anyReg.primary === 'number') return anyReg.primary === id;
    } catch {}
    return false;
  }

  setPrimary(id: number) {
    this.reg.setPrimary(id);
  }

  logout() {
    this.auth.logout();
  }
}

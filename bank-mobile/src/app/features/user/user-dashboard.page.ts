import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonCard, IonCardContent,
  IonGrid, IonRow, IonCol,
  IonList, IonItem, IonLabel, IonText, IonBadge
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  personCircleOutline,
  walletOutline,
  swapHorizontalOutline,
  documentTextOutline,
  cardOutline,
  chevronForwardOutline,
  sendOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [
    CommonModule, NgIf, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonCard, IonCardContent,
    IonGrid, IonRow, IonCol,
    IonList, IonItem, IonLabel, IonText, IonBadge
  ],
  styles: [`
    /* Header */
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

    /* Center page on large screens */
    .page-container {
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
    }

    /* Welcome card */
    .welcome-card {
      border-radius: 16px;
      box-shadow: 0 8px 22px rgba(0,0,0,0.12);
      overflow: hidden;
    }
    .welcome-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-chip {
      background: linear-gradient(90deg,#6a11cb,#2575fc);
      color: #fff;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .4px;
    }

    /* Summary tiles */
    .tile {
      border-radius: 14px;
      padding: clamp(14px, 2.8vw, 18px);
      background: #fff;
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      gap: 4px;
      height: 100%;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    }
    .tile-label {
      color: var(--ion-color-medium);
      font-size: clamp(11px, 1.8vw, 12px);
      letter-spacing: .3px;
    }
    .tile-value {
      font-size: clamp(18px, 3.6vw, 22px);
      font-weight: 800;
    }
    .tile-note {
      font-size: clamp(11px, 1.8vw, 12px);
      color: var(--ion-color-medium);
    }

    /* Quick actions – responsive auto-wrap */
    .section-title {
      display: flex; align-items: center; justify-content: space-between;
      margin: clamp(14px, 2.8vw, 18px) 4px 10px;
      font-weight: 800;
      letter-spacing: .2px;
      font-size: clamp(14px, 2.6vw, 18px);
    }
    .link {
      font-size: clamp(11px, 1.8vw, 12px);
      color: var(--ion-color-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .qa-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    @media (max-width: 1024px) {
      .qa-row { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 600px) {
      .qa-row { grid-template-columns: repeat(3, 1fr); }
    }
    .qa-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: #fff;
      border: none;
      border-radius: 14px;
      padding: clamp(12px, 2.4vw, 14px) 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      transition: transform .12s ease, box-shadow .12s ease;
      cursor: pointer;
    }
    .qa-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(0,0,0,0.12);
    }
    .qa-label {
      font-size: clamp(11px, 1.8vw, 12px);
      color: var(--ion-color-dark);
      letter-spacing: .2px;
    }

    /* Recent list */
    .recent-list ion-item {
      --padding-start: 12px;
      --inner-padding-end: 8px;
      border-radius: 12px;
      margin: 6px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      background: #fff;
    }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>BANK</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="page-container">
        <!-- Welcome -->
        <ion-card class="welcome-card">
          <ion-card-content>
            <div class="welcome-header">
              <ion-icon name="person-circle-outline" style="font-size:36px;"></ion-icon>
              <div>
                <div style="font-weight:800; font-size:18px;">Welcome back</div>
                <div style="color:var(--ion-color-medium); font-size:13px;">{{ email || 'User' }}</div>
              </div>
              <span class="brand-chip" style="margin-left:auto;">USER</span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Summary tiles -->
        <ion-grid fixed>
          <ion-row>
            <ion-col size="12" sizeMd="4">
              <div class="tile">
                <div class="tile-label">Total Balance</div>
                <div class="tile-value">—</div>
                <div class="tile-note">Across all accounts</div>
              </div>
            </ion-col>
            <ion-col size="12" sizeMd="4">
              <div class="tile">
                <div class="tile-label">Accounts</div>
                <div class="tile-value">—</div>
                <div class="tile-note">Savings • Checking • Others</div>
              </div>
            </ion-col>
            <ion-col size="12" sizeMd="4">
              <div class="tile">
                <div class="tile-label">KYC Status</div>
                <div class="tile-value">
                  <ion-badge color="warning" style="font-weight:700;">Pending</ion-badge>
                </div>
                <div class="tile-note">Complete your KYC to unlock all features</div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Quick actions -->
        <div class="section-title">
          <div>Quick Actions</div>
        </div>
        <div class="qa-row">
          <button class="qa-btn" (click)="go('/user/profile')">
            <ion-icon name="person-circle-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">Profile</span>
          </button>
          <button class="qa-btn" (click)="go('/user/accounts')">
            <ion-icon name="wallet-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">Accounts</span>
          </button>
          <button class="qa-btn" (click)="go('/user/transfer/internal')">
            <ion-icon name="swap-horizontal-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">Internal</span>
          </button>
          <button class="qa-btn" (click)="go('/user/transfer/external')">
            <ion-icon name="send-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">External</span>
          </button>
          <button class="qa-btn" (click)="go('/user/transactions/history')">
            <ion-icon name="document-text-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">History</span>
          </button>
          <button class="qa-btn" (click)="go('/user/kyc')">
            <ion-icon name="card-outline" style="font-size:24px;"></ion-icon>
            <span class="qa-label">KYC</span>
          </button>
        </div>

        <!-- Recent -->
        <div class="section-title">
          <div>Recent</div>
          <a class="link" (click)="go('/user/transactions/history')">
            View all <ion-icon name="chevron-forward-outline"></ion-icon>
          </a>
        </div>
        <ion-list class="recent-list" inset>
          <ion-item button detail (click)="go('/user/transfer/internal')">
            <ion-label>
              <div style="font-weight:700;">Internal Transfer</div>
              <div style="color:var(--ion-color-medium); font-size:12px;">Move money between your accounts</div>
            </ion-label>
          </ion-item>
          <ion-item button detail (click)="go('/user/transfer/external')">
            <ion-label>
              <div style="font-weight:700;">External Transfer</div>
              <div style="color:var(--ion-color-medium); font-size:12px;">Send to another bank</div>
            </ion-label>
          </ion-item>
          <ion-item button detail (click)="go('/user/accounts')">
            <ion-label>
              <div style="font-weight:700;">Accounts</div>
              <div style="color:var(--ion-color-medium); font-size:12px;">Manage and open new accounts</div>
            </ion-label>
          </ion-item>
           <ion-item button detail (click)="go('/user/transactions/statement')">
    <ion-label>Statements</ion-label>
  </ion-item>
        </ion-list>

        <ion-text color="medium" class="ion-margin-top" *ngIf="lastTap">
          Last tap: {{ lastTap }}
        </ion-text>
      </div>
    </ion-content>
  `
})
export class UserDashboardPage {
  email = this.auth.getEmail?.() || '';
  lastTap = '';

  constructor(private auth: AuthService, private router: Router) {
    addIcons({
      logOutOutline,
      personCircleOutline,
      walletOutline,
      swapHorizontalOutline,
      documentTextOutline,
      cardOutline,
      chevronForwardOutline,
      sendOutline
    });
  }

  go(path: string) {
    this.lastTap = path;
    this.router.navigateByUrl(path);
  }

  logout() {
    this.auth.logout?.();
  }
}

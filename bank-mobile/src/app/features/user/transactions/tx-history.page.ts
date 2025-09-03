import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
  IonRefresher, IonRefresherContent, IonItemDivider, IonBadge,
  IonChip, IonSearchbar, IonSkeletonText, IonNote
} from '@ionic/angular/standalone';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  logOutOutline, refreshOutline, funnelOutline,
  cardOutline, arrowDownCircleOutline, arrowUpCircleOutline, informationCircleOutline
} from 'ionicons/icons';

type TxRow = {
  ts: string | number | Date;
  type: string;                 // "CREDIT" | "DEBIT" | etc.
  amount: number;
  runningBalance?: number;
  description?: string;
  externalId?: string;
};

type TxGroup = { dateLabel: string; items: TxRow[] };

@Component({
  standalone: true,
  selector: 'app-tx-history',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
    IonRefresher, IonRefresherContent, IonItemDivider, IonBadge,
    IonChip, IonSearchbar, IonSkeletonText, IonNote
  ],
  styles: [`
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
    .page-container { width: 100%; max-width: 960px; margin: 0 auto; }

    .filters {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr;
      margin-bottom: 12px;
    }
    @media (min-width: 640px) {
      .filters {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
    }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .toolbar-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

    ion-item-divider {
      --background: #f6f7fb;
      --color: var(--ion-color-medium);
      position: sticky;
      top: 0;
      z-index: 1;
      border: 0;
      font-weight: 700;
      letter-spacing: .2px;
    }

    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .amt { font-weight: 800; }
    .credit { color: var(--ion-color-success); }
    .debit  { color: var(--ion-color-danger); }
    .muted { color: var(--ion-color-medium); }

    .empty {
      text-align:center; color: var(--ion-color-medium);
      padding: 32px 8px;
    }
    .empty .big { font-size: 56px; color: var(--ion-color-primary); opacity:.9; }
  `],
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-title>Transaction History</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="load(true)" aria-label="Refresh">
            <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()" aria-label="Logout">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="page-container">
        <!-- Filters -->
        <form [formGroup]="form" (ngSubmit)="load(true)">
          <div class="filters">
            <ion-item lines="inset">
              <ion-label position="stacked">Account</ion-label>
              <ion-select formControlName="accountId" interface="popover">
                <ion-select-option *ngFor="let id of ids" [value]="id">#{{ id }}</ion-select-option>
              </ion-select>
            </ion-item>

            <div class="toolbar-row">
              <ion-searchbar
                placeholder="Search description or reference"
                [debounce]="250"
                (ionInput)="onSearch($event)">
              </ion-searchbar>

              <ion-chip [outline]="range!=='7d'" (click)="setRange('7d')">Last 7d</ion-chip>
              <ion-chip [outline]="range!=='30d'" (click)="setRange('30d')">Last 30d</ion-chip>
              <ion-chip [outline]="range!=='all'" (click)="setRange('all')">All</ion-chip>

              <ion-chip [outline]="type!=='ALL'" (click)="setType('ALL')">
                <ion-icon name="funnel-outline"></ion-icon>&nbsp;All
              </ion-chip>
              <ion-chip [outline]="type!=='CREDIT'" (click)="setType('CREDIT')">
                <ion-icon name="arrow-down-circle-outline"></ion-icon>&nbsp;Credit
              </ion-chip>
              <ion-chip [outline]="type!=='DEBIT'" (click)="setType('DEBIT')">
                <ion-icon name="arrow-up-circle-outline"></ion-icon>&nbsp;Debit
              </ion-chip>

              <ion-button type="submit" fill="outline" size="small">
                <ion-icon name="refresh-outline" slot="start"></ion-icon>
                Load
              </ion-button>
            </div>
          </div>
        </form>

        <!-- Skeleton while loading the first time -->
        <ion-list *ngIf="loading && !groups.length">
          <ion-item *ngFor="let i of [1,2,3,4,5]">
            <ion-label>
              <ion-skeleton-text [animated]="true" style="width: 40%; height: 14px;"></ion-skeleton-text>
              <ion-skeleton-text [animated]="true" style="width: 70%; height: 12px; margin-top:6px;"></ion-skeleton-text>
            </ion-label>
            <ion-skeleton-text [animated]="true" slot="end" style="width: 60px; height: 16px;"></ion-skeleton-text>
          </ion-item>
        </ion-list>

        <!-- Grouped results -->
        <ng-container *ngIf="groups.length">
          <ion-list>
            <ng-container *ngFor="let g of groups; trackBy: trackDate">
              <ion-item-divider sticky="true">{{ g.dateLabel }}</ion-item-divider>

              <ion-item *ngFor="let r of g.items; trackBy: trackTx">
                <ion-icon [name]="isCredit(r) ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'"
                          slot="start" [color]="isCredit(r) ? 'success' : 'danger'"></ion-icon>

                <ion-label>
                  <div style="display:flex; gap:6px; align-items:baseline; flex-wrap:wrap;">
                    <strong>{{ r.description || (isCredit(r) ? 'Credit' : 'Debit') }}</strong>
                    <ion-badge [color]="isCredit(r) ? 'success' : 'danger'">{{ (r.type || '').toUpperCase() }}</ion-badge>
                  </div>
                  <div class="muted">
                    {{ r.ts | date:'medium' }}
                    <span *ngIf="r.externalId"> • <span class="mono">{{ r.externalId }}</span></span>
                  </div>
                  <ion-note class="muted" *ngIf="r.runningBalance !== undefined">
                    Running: {{ r.runningBalance | number:'1.2-2' }}
                  </ion-note>
                </ion-label>

                <div class="amt" [class.credit]="isCredit(r)" [class.debit]="!isCredit(r)" slot="end">
                  {{ isCredit(r) ? '+' : '-' }}{{ r.amount | number:'1.2-2' }}
                </div>
              </ion-item>
            </ng-container>
          </ion-list>
        </ng-container>

        <!-- Empty state -->
        <div class="empty" *ngIf="!loading && !groups.length">
          <ion-icon class="big" name="information-circle-outline"></ion-icon>
          <p>No transactions found. Try a different range or account.</p>
        </div>
      </div>
    </ion-content>
    
  `
})
export class TxHistoryPage implements OnInit {
  ids: number[] = [];
  allRows: TxRow[] = [];
  groups: TxGroup[] = [];

  loading = false;

  // Filters
  range: '7d' | '30d' | 'all' = '30d';
  type: 'ALL' | 'CREDIT' | 'DEBIT' = 'ALL';
  term = '';

  form = this.fb.group({
    accountId: [null as number | null, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private tx: TransactionService,
    private reg: AccountRegistryService,
    private auth: AuthService
  ) {
    addIcons({
      logOutOutline, refreshOutline, funnelOutline,
      cardOutline, arrowDownCircleOutline, arrowUpCircleOutline, informationCircleOutline
    });
  }

  ngOnInit() {
    this.ids = this.reg.list();
    const primary = this.safePrimary();
    const initial = (primary && this.ids.includes(primary)) ? primary : (this.ids[0] ?? null);
    if (initial) this.form.patchValue({ accountId: initial });

    // Initial load
    this.load(true);
  }

  logout() { this.auth.logout?.(); }

  // ---------- Load & transform ----------
  load(force = false) {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;

    this.loading = true;
    this.tx.history(accountId).subscribe({
      next: (rows: TxRow[] = []) => {
        // Normalize: sort desc by timestamp
        this.allRows = rows
          .slice()
          .sort((a, b) => (this.getTime(b.ts) - this.getTime(a.ts)));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.allRows = [];
        this.groups = [];
        this.loading = false;
      }
    });
  }

  doRefresh(ev: CustomEvent) {
    this.load(true);
    setTimeout(() => (ev.target as any).complete(), 350);
  }

  // ---------- Filters ----------
  onSearch(ev: CustomEvent) {
    const v: any = (ev.detail as any)?.value;
    this.term = (v ?? '').toString().trim().toLowerCase();
    this.applyFilters();
  }

  setRange(v: '7d' | '30d' | 'all') {
    this.range = v;
    this.applyFilters();
  }

  setType(v: 'ALL' | 'CREDIT' | 'DEBIT') {
    this.type = v;
    this.applyFilters();
  }

  private applyFilters() {
    const now = Date.now();
    const horizon =
      this.range === '7d' ? now - 7 * 86400000 :
      this.range === '30d' ? now - 30 * 86400000 : 0;

    let filtered = this.allRows.filter(r => {
      const ts = this.getTime(r.ts);
      if (this.range !== 'all' && ts < horizon) return false;

      if (this.type !== 'ALL') {
        const t = (r.type || '').toUpperCase();
        if (this.type === 'CREDIT' && !t.includes('CREDIT')) return false;
        if (this.type === 'DEBIT'  && !t.includes('DEBIT'))  return false;
      }

      if (this.term) {
        const blob = `${r.description || ''} ${r.externalId || ''}`.toLowerCase();
        if (!blob.includes(this.term)) return false;
      }
      return true;
    });

    // Group by day (YYYY-MM-DD), keep order
    const groupsMap = new Map<string, TxRow[]>();
    for (const r of filtered) {
      const d = new Date(this.getTime(r.ts));
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key)!.push(r);
    }

    const entries = Array.from(groupsMap.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1)); // desc by date

    this.groups = entries.map(([key, items]) => ({
      dateLabel: this.friendlyDateLabel(key),
      items
    }));
  }

  // ---------- Helpers ----------
  isCredit(r: TxRow): boolean {
    return (r.type || '').toUpperCase().includes('CREDIT');
  }

  getTime(v: TxRow['ts']): number {
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'number') return v;
    const t = Date.parse(String(v));
    return isNaN(t) ? 0 : t;
    }

  friendlyDateLabel(key: string): string {
    const [y, m, d] = key.split('-').map(n => Number(n));
    const date = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = (today.getTime() - date.getTime()) / 86400000;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    // e.g., Sep 3, 2025
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackDate = (_: number, g: TxGroup) => g.dateLabel;
  trackTx = (_: number, r: TxRow) => (r as any).id || r.externalId || `${this.getTime(r.ts)}-${r.amount}`;
  
  private safePrimary(): number | null {
    try {
      const anyReg = this.reg as any;
      if (typeof anyReg.primary === 'function') return Number(anyReg.primary());
      if (typeof anyReg.getPrimary === 'function') return Number(anyReg.getPrimary());
      if (typeof anyReg.primary === 'number') return Number(anyReg.primary);
    } catch {}
    return null;
  }
}

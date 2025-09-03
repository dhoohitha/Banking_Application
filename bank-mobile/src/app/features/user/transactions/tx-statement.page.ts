import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonItemDivider, IonSkeletonText,
  IonRefresher, IonRefresherContent, IonLoading
} from '@ionic/angular/standalone';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountRegistryService } from '../../../core/utils/account-registry.service';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  logOutOutline, downloadOutline, refreshOutline,
  arrowDownCircleOutline, arrowUpCircleOutline, informationCircleOutline
} from 'ionicons/icons';

type StatementRow = {
  id?: string | number;
  ts: string | number | Date;
  type: string;            // "CREDIT" | "DEBIT" | etc.
  amount: number;
  status?: string;         // e.g., "OK" | "PENDING" | "FAILED"
  description?: string;
  runningBalance?: number; // if backend provides
  externalId?: string;
};

@Component({
  standalone: true,
  selector: 'app-tx-statement',
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonItemDivider, IonSkeletonText,
    IonRefresher, IonRefresherContent, IonLoading
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

    .toolbar-row {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr;
      margin-bottom: 12px;
    }
    @media (min-width: 680px) {
      .toolbar-row { grid-template-columns: 1fr auto auto; align-items: end; }
    }
    .btns { display: flex; gap: 10px; flex-wrap: wrap; }

    ion-item-divider {
      --background: #f6f7fb;
      --color: var(--ion-color-medium);
      position: sticky; top: 0; z-index: 1; border: 0;
      font-weight: 700; letter-spacing: .2px;
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
        <ion-title>Statement</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="reload()" aria-label="Refresh">
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
        <form [formGroup]="form" (ngSubmit)="load(true)" novalidate>
          <div class="toolbar-row">
            <ion-item lines="inset">
              <ion-label position="stacked">Account</ion-label>
              <ion-select formControlName="accountId" interface="popover">
                <ion-select-option *ngFor="let id of ids" [value]="id">#{{ id }}</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="inset">
              <ion-label position="stacked">Page size</ion-label>
              <ion-select [value]="size" (ionChange)="changeSize($event)">
                <ion-select-option [value]="10">10</ion-select-option>
                <ion-select-option [value]="25">25</ion-select-option>
                <ion-select-option [value]="50">50</ion-select-option>
              </ion-select>
            </ion-item>

            <div class="btns">
              <ion-button type="submit" fill="outline">
                <ion-icon name="refresh-outline" slot="start"></ion-icon>
                Load
              </ion-button>
              <ion-button color="primary" (click)="exportCsv()" [disabled]="!form.value.accountId || loading">
                <ion-icon name="download-outline" slot="start"></ion-icon>
                Export CSV
              </ion-button>
            </div>
          </div>
        </form>

        <!-- Skeletons when first loading -->
        <ion-list *ngIf="loading && !rows.length">
          <ion-item *ngFor="let i of [1,2,3,4,5]">
            <ion-icon slot="start" name="arrow-down-circle-outline" style="opacity:.2;"></ion-icon>
            <ion-label>
              <ion-skeleton-text [animated]="true" style="width: 40%; height: 14px;"></ion-skeleton-text>
              <ion-skeleton-text [animated]="true" style="width: 70%; height: 12px; margin-top:6px;"></ion-skeleton-text>
            </ion-label>
            <ion-skeleton-text [animated]="true" slot="end" style="width: 60px; height: 16px;"></ion-skeleton-text>
          </ion-item>
        </ion-list>

        <!-- Results -->
        <ng-container *ngIf="rows.length">
          <ion-item-divider sticky="true">
            Page {{ page + 1 }} • Showing {{ rows.length }} item(s)
          </ion-item-divider>

          <ion-list>
            <ion-item *ngFor="let r of rows; trackBy: trackRow">
              <ion-icon [name]="isCredit(r) ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'"
                        slot="start" [color]="isCredit(r) ? 'success' : 'danger'"></ion-icon>

              <ion-label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <strong>{{ r.description || (isCredit(r) ? 'Credit' : 'Debit') }}</strong>
                  <ion-badge [color]="isCredit(r) ? 'success' : 'danger'">{{ (r.type || '').toUpperCase() }}</ion-badge>
                  <ion-badge [color]="badgeColor(r.status)">{{ r.status || 'OK' }}</ion-badge>
                </div>

                <div class="muted">
                  {{ r.ts | date:'medium' }}
                  <ng-container *ngIf="r.externalId"> • <span class="mono">{{ r.externalId }}</span></ng-container>
                </div>

                <div class="muted" *ngIf="r.runningBalance !== undefined">
                  Running: {{ r.runningBalance | number:'1.2-2' }}
                </div>
              </ion-label>

              <div class="amt" [class.credit]="isCredit(r)" [class.debit]="!isCredit(r)" slot="end">
                {{ isCredit(r) ? '+' : '-' }}{{ r.amount | number:'1.2-2' }}
              </div>
            </ion-item>
          </ion-list>

          <div class="btns" style="margin-top:12px;" *ngIf="hasMore">
            <ion-button (click)="next()" [disabled]="loading">Load more</ion-button>
          </div>
        </ng-container>

        <!-- Empty state -->
        <div class="empty" *ngIf="!loading && !rows.length && ids.length">
          <ion-icon class="big" name="information-circle-outline"></ion-icon>
          <p>No records. Choose an account and press Load.</p>
        </div>

        <!-- No accounts -->
        <div class="empty" *ngIf="!ids.length">
          <ion-icon class="big" name="information-circle-outline"></ion-icon>
          <p>No accounts found. Open an account first.</p>
        </div>
      </div>

      <ion-loading [isOpen]="loading" message="Loading..." spinner="bubbles"></ion-loading>
    </ion-content>
  `
})
export class TxStatementPage implements OnInit {
  ids: number[] = [];
  rows: StatementRow[] = [];

  page = 0;
  size = 10;
  hasMore = false;
  loading = false;

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
      logOutOutline, downloadOutline, refreshOutline,
      arrowDownCircleOutline, arrowUpCircleOutline, informationCircleOutline
    });
  }

  ngOnInit() {
    // load accounts and preselect primary/first
    this.ids = this.reg.list();
    const primary = this.safePrimary();
    const initial = (primary && this.ids.includes(primary)) ? primary : (this.ids[0] ?? null);
    if (initial) this.form.patchValue({ accountId: initial });

    // initial load (only if we have an account)
    if (initial) this.load(true);
  }

  // -------- UI actions --------
  reload() { this.load(true); }

  changeSize(ev: CustomEvent) {
    const newSize = Number((ev.detail as any).value);
    if (newSize && newSize !== this.size) {
      this.size = newSize;
      this.load(true);
    }
  }

  doRefresh(ev: CustomEvent) {
    this.load(true);
    setTimeout(() => (ev.target as any).complete(), 350);
  }

  // -------- Data loading --------
  load(reset = false) {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;

    if (reset) { this.page = 0; this.rows = []; this.hasMore = false; }
    this.fetch();
  }

  next() {
    if (!this.hasMore || this.loading) return;
    this.page++;
    this.fetch(true);
  }

  private fetch(append = false) {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;

    this.loading = true;
    this.tx.statement(accountId, this.page, this.size).subscribe({
      next: (res: any) => {
        const items: StatementRow[] = Array.isArray(res?.content)
          ? res.content
          : (Array.isArray(res) ? res : []);

        this.hasMore = !!res?.totalPages ? (this.page + 1 < res.totalPages) : items.length === this.size;

        this.rows = append ? [...this.rows, ...items] : items;
        this.loading = false;
      },
      error: () => {
        this.rows = [];
        this.hasMore = false;
        this.loading = false;
      }
    });
  }

  exportCsv() {
    const accountId = Number(this.form.value.accountId);
    if (!accountId) return;

    this.loading = true;
    this.tx.exportCsv(accountId).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement_${accountId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      error: () => { this.loading = false; }
    });
  }

  // -------- Helpers --------
  isCredit(r: StatementRow): boolean {
    return (r.type || '').toUpperCase().includes('CREDIT');
  }

  badgeColor(status?: string): string {
    const s = (status || 'OK').toUpperCase();
    if (s.includes('PEND')) return 'warning';
    if (s.includes('FAIL') || s.includes('REJECT')) return 'danger';
    return 'success';
  }

  trackRow = (_: number, r: StatementRow) => r.id || r.externalId || `${r.ts}-${r.amount}`;

  private safePrimary(): number | null {
    try {
      const anyReg = this.reg as any;
      if (typeof anyReg.primary === 'function') return Number(anyReg.primary());
      if (typeof anyReg.getPrimary === 'function') return Number(anyReg.getPrimary());
      if (typeof anyReg.primary === 'number') return Number(anyReg.primary);
    } catch {}
    return null;
  }

  logout() { this.auth.logout?.(); }
}

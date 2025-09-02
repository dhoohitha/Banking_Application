import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountRegistryService {
  private key = 'myAccountIds';

  list(): number[] {
    const raw = localStorage.getItem(this.key);
    try { return raw ? (JSON.parse(raw) as number[]) : []; } catch { return []; }
  }

  add(id: number) {
    const s = new Set(this.list());
    s.add(id);
    localStorage.setItem(this.key, JSON.stringify(Array.from(s)));
    // also set a "primary" if absent
    if (!localStorage.getItem('primaryAccountId')) {
      localStorage.setItem('primaryAccountId', String(id));
    }
  }

  remove(id: number) {
    const next = this.list().filter(x => x !== id);
    localStorage.setItem(this.key, JSON.stringify(next));
    const primary = Number(localStorage.getItem('primaryAccountId') || 0);
    if (primary === id) localStorage.removeItem('primaryAccountId');
  }

  primary(): number | null {
    const v = localStorage.getItem('primaryAccountId');
    return v ? Number(v) : null;
  }

  setPrimary(id: number) {
    localStorage.setItem('primaryAccountId', String(id));
    this.add(id); // ensure it’s in the list
  }
}

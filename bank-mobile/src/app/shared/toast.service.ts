import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private tc: ToastController) {}
  async success(msg: string) {
    const t = await this.tc.create({ message: msg, duration: 1800, color: 'success' });
    await t.present();
  }
  async error(msg: string) {
    const t = await this.tc.create({ message: msg, duration: 2200, color: 'danger' });
    await t.present();
  }
}

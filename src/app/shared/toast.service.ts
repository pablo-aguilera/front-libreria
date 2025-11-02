import { Injectable, signal } from '@angular/core';

export type ToastLevel = 'success' | 'error' | 'info';
export interface ToastMsg { id: number; text: string; level: ToastLevel; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  list = signal<ToastMsg[]>([]);
  #id = 1;

  /** Agrega un toast y lo cierra automáticamente después de `ms` ms */
  push(text: string, level: ToastLevel = 'info', ms = 2800) {
    const msg: ToastMsg = { id: this.#id++, text, level };
    this.list.update(arr => [...arr, msg]);
    setTimeout(() => this.dismiss(msg.id), ms);
  }

  /** Atajos de nivel */
  success(t: string) { this.push(t, 'success'); }
  info(t: string) { this.push(t, 'info'); }
  error(t: string) { this.push(t, 'error', 4000); }

  /** Alias opcional para compatibilidad (si algún sitio usaba `ok`) */
  ok(t: string) { this.success(t); }

  /** Cierra un toast por id */
  dismiss(id: number) {
    this.list.update(arr => arr.filter(x => x.id !== id));
  }
}

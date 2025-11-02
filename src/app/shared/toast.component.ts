import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  selector: 'app-toast-host',
  imports: [CommonModule],
  template: `
  <section class="toast-host">
    <div *ngFor="let t of toast.list()" class="toast" [class.ok]="t.level==='success'" [class.err]="t.level==='error'">
      {{t.text}}
      <button (click)="toast.dismiss(t.id)" aria-label="Cerrar">✕</button>
    </div>
  </section>`,
  styles: [`
    .toast-host{position:fixed;right:12px;bottom:12px;display:flex;flex-direction:column;gap:8px;z-index:50}
    .toast{background:#111827;color:#fff;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;gap:10px;align-items:center}
    .toast.ok{background:#065f46}
    .toast.err{background:#7f1d1d}
    .toast button{background:transparent;border:0;color:#fff;font-weight:bold;cursor:pointer}
  `]
})
export class ToastHostComponent { toast = inject(ToastService); }

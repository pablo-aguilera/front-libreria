import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  standalone: true,
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
  <div class="overlay" *ngIf="svc.active() > 0" aria-live="polite" aria-busy="true">
    <div class="spinner" title="Cargando…"></div>
  </div>
  `,
  styles: [`
    .overlay{position:fixed;inset:0;background:rgba(15,23,42,.08);display:grid;place-items:center;z-index:50}
    .spinner{width:38px;height:38px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;
      animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  `]
})
export class LoaderComponent {
  svc = inject(LoaderService);
}

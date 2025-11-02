import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../core/books.service';
import { IconComponent } from './icon.component';

@Component({
  standalone: true,
  selector: 'app-book-card',
  imports: [CommonModule, IconComponent],
  template: `
  <article class="card" tabindex="0" aria-label="Tarjeta de libro">
    <header class="card-h">
      <app-icon name="book"></app-icon>
      <h3>{{book.title}}</h3>
    </header>
    <p><strong>Autor:</strong> {{book.author}}</p>
    <p *ngIf="book.year"><strong>Año:</strong> {{book.year}}</p>
    <p><strong>Disponibles:</strong> 
      <span class="badge" [class.bad]="book.available===0">{{book.available}}</span> / {{book.copies}}
    </p>
    <ng-content></ng-content>
  </article>`,
  styles: [`
    .card{border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--card);
      box-shadow:0 4px 10px rgba(0,0,0,.04)}
    .card-h{display:flex;gap:8px;align-items:center;margin-bottom:6px}
    .badge{display:inline-block;min-width:22px;text-align:center;padding:2px 6px;border-radius:999px;background:#ecfeff;color:#155e75}
    .badge.bad{background:#fee2e2;color:#7f1d1d}
  `]
})
export class BookCardComponent { @Input({ required: true }) book!: Book; }

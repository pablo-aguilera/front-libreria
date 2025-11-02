import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BooksApi, Book } from '../../core/books.api';
import { LoansApi } from '../../core/loans.api';
import { AuthService } from '../../core/auth.service';
import { IconComponent } from '../../shared/icon.component';
import { LoaderService } from '../../shared/loader.service';
import { ToastService } from '../../shared/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
  <section class="card">
    <h2><app-icon name="book"></app-icon> Libros</h2>

    <div class="grid">
      <label>
        <span>Buscar</span>
        <input [(ngModel)]="q" (keyup.enter)="load()" placeholder="título, autor, ISBN...">
      </label>
      <div class="actions">
        <button class="btn" (click)="load()"><app-icon name="search"></app-icon> Buscar</button>
        <button class="btn" (click)="clear()"><app-icon name="refresh"></app-icon> Limpiar</button>
      </div>
    </div>

    <div class="list">
      <div class="item" *ngFor="let b of items()">
        <div class="main">
          <div class="title">{{ b.title }}</div>
          <div class="meta">{{ b.author }} <span *ngIf="b.year">• {{ b.year }}</span></div>
          <div class="stock">Disponibles: <b>{{ b.available ?? 0 }}</b> / {{ b.copies ?? 0 }}</div>
        </div>

        <!-- Botón Solicitar solo para estudiantes y si hay stock -->
        <div class="ops" *ngIf="auth.isLoggedIn() && auth.role()==='student'">
          <button class="btn primary"
                  (click)="request(b)"
                  [disabled]="(b.available ?? 0) <= 0">
            <app-icon name="plus"></app-icon> Solicitar
          </button>
        </div>
      </div>
    </div>

    <div class="pager" *ngIf="pages>1">
      <button class="btn" [disabled]="page===1" (click)="goto(page-1)">«</button>
      <span>Página {{page}} / {{pages}}</span>
      <button class="btn" [disabled]="page===pages" (click)="goto(page+1)">»</button>
    </div>
  </section>
  `,
  styles: [`
    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
    .grid{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end;margin-bottom:12px}
    label{display:flex;flex-direction:column;gap:6px}
    input{padding:8px;border:1px solid var(--border);border-radius:8px;background:white}
    .actions{display:flex;gap:8px;align-items:center}
    .btn{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:10px;padding:6px 10px;background:var(--card);cursor:pointer}
    .btn.primary{background:#e0f2fe;border-color:#bae6fd}
    .list{display:flex;flex-direction:column;gap:10px;margin-top:10px}
    .item{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--border);border-radius:12px;padding:12px}
    .title{font-weight:700}
    .meta{color:var(--muted)}
    .ops{display:flex;gap:8px}
    .pager{display:flex;gap:10px;justify-content:center;align-items:center;margin-top:12px}
  `]
})
export class BooksComponent implements OnInit {
  private booksApi = inject(BooksApi);
  private loansApi = inject(LoansApi);
  auth = inject(AuthService);
  private loader = inject(LoaderService);
  private toast = inject(ToastService);

  q = '';
  page = 1;
  pages = 1;

  items = signal<Book[]>([]);

  async ngOnInit(){ await this.load(); }

  async load() {
    this.loader.show();
    try {
      const res = await firstValueFrom(this.booksApi.list({ q: this.q, page: this.page, limit: 12 }));
      this.items.set(res.items || []);
      this.pages = res.pages || 1;
    } catch (e) {
      this.toast.error('No se pudieron cargar libros');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  clear(){ this.q=''; this.page=1; this.load(); }
  goto(p: number){ this.page = Math.min(Math.max(1, p), this.pages); this.load(); }

  async request(b: Book){
    if (!b?._id) return;
    this.loader.show();
    try{
      // ✅ Enviar objeto con bookId (coincide con LoansApi.request)
      await firstValueFrom(this.loansApi.request({ bookId: b._id }));
      this.toast.success('Solicitud enviada');
    }catch(e:any){
      this.toast.error(e?.error?.error || 'No se pudo solicitar');
      console.error(e);
    }finally{
      this.loader.hide();
    }
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { BooksApi, Book } from '../../core/books.api';
import { UsersApi, UserLight } from '../../core/users.api';
import { LoansApi, Loan } from '../../core/loans.api';
import { ToastService } from '../../shared/toast.service';
import { LoaderService } from '../../shared/loader.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-loans-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
  <section class="card">
    <h2><app-icon name="shield"></app-icon> Admin Préstamos</h2>

    <div class="grid">
      <label>
        <span>Estudiante</span>
        <select [(ngModel)]="selectedUserId">
          <option [ngValue]="null" disabled>Selecciona estudiante...</option>
          <option *ngFor="let u of students(); trackBy: trackByUser" [ngValue]="u.id">
            {{u.name}} — {{u.email}}
          </option>
        </select>
      </label>

      <label>
        <span>Libro</span>
        <select [(ngModel)]="selectedBookId">
          <option [ngValue]="null" disabled>Selecciona libro...</option>
          <option *ngFor="let b of booksAvail(); trackBy: trackByBook" [ngValue]="b._id">
            {{ b?.title ?? '(sin título)' }} (disp: {{ (b?.available ?? 0) }})
          </option>
        </select>
      </label>

      <div class="actions">
        <button class="btn primary" (click)="createLoan()" [disabled]="!selectedUserId || !selectedBookId">
          <app-icon name="plus"></app-icon> Prestar directo
        </button>
      </div>
    </div>

    <h3 class="mt">Solicitudes pendientes</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Libro</th><th>Estudiante</th><th>Estado</th><th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let r of requests(); trackBy: trackByLoan">
          <td>{{ r?.book?.['title'] ?? '(sin título)' }}</td>
          <td>{{ r?.user?.['name'] ?? '(sin nombre)' }}</td>
          <td><span class="badge">{{ r?.status }}</span></td>
          <td class="row-actions">
            <button class="btn" (click)="approve(r)"><app-icon name="check"></app-icon> Aprobar</button>
            <button class="btn danger" (click)="reject(r)"><app-icon name="trash"></app-icon> Rechazar</button>
          </td>
        </tr>
        <tr *ngIf="requests().length === 0">
          <td colspan="4" class="muted">Sin solicitudes</td>
        </tr>
      </tbody>
    </table>

    <h3 class="mt">Préstamos</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Libro</th><th>Estudiante</th><th>Inicio</th><th>Estado</th><th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of loans(); trackBy: trackByLoan">
          <td>{{ l?.book?.['title'] ?? '(sin título)' }}</td>
          <td>{{ l?.user?.['name'] ?? '(sin nombre)' }}</td>
          <td>{{ l?.startDate | date:'yyyy-MM-dd HH:mm' }}</td>
          <td>
            <span class="badge" [class.ok]="l?.status==='active'" [class.muted]="l?.status!=='active'">
              {{ l?.status ?? '—' }}
            </span>
          </td>
          <td>
            <button class="btn" (click)="returnLoan(l)" [disabled]="l?.status!=='active'">
              <app-icon name="check"></app-icon> Devolver
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  `,
  styles: [`
    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:end}
    label{display:flex;flex-direction:column;gap:6px}
    select{padding:8px;border:1px solid var(--border);border-radius:8px;background:white}
    .actions{display:flex;gap:8px;align-items:center}
    .btn{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:10px;padding:6px 10px;background:var(--card);cursor:pointer}
    .btn.primary{background:#e0f2fe;border-color:#bae6fd}
    .btn.danger{background:#fee2e2;border-color:#fecaca}
    .table{width:100%;border-collapse:separate;border-spacing:0 6px;margin-top:14px}
    th,td{padding:10px}
    thead th{color:var(--muted);font-weight:600;border-bottom:1px solid var(--border)}
    .badge{padding:2px 8px;border:1px solid var(--border);border-radius:999px}
    .badge.ok{background:#ecfdf5;border-color:#bbf7d0}
    .badge.muted{color:var(--muted)}
    .mt{margin-top:18px}
    .row-actions{display:flex;gap:8px}
    .muted{color:var(--muted)}
  `]
})
export class LoansAdminComponent implements OnInit {
  private booksApi = inject(BooksApi);
  private usersApi = inject(UsersApi);
  private loansApi = inject(LoansApi);
  private toast = inject(ToastService);
  private loader = inject(LoaderService);

  students = signal<UserLight[]>([]);
  booksAvail = signal<Book[]>([]);
  loans = signal<Loan[]>([]);
  requests = signal<Loan[]>([]);

  selectedUserId: string | null = null;
  selectedBookId: string | null = null;

  async ngOnInit() {
    this.loader.show();
    try {
      await this.refreshAll();
    } catch (e: unknown) {
      this.toast.error('No se pudieron cargar datos iniciales');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  private async refreshAll() {
    // Estudiantes
    const usersRes = await firstValueFrom(this.usersApi.list('student'));
    const users = Array.isArray(usersRes) ? usersRes : [];
    this.students.set(users.filter(u => u.role === 'student'));

    // Libros disponibles > 0
    const booksRes = await firstValueFrom(this.booksApi.list({ page: 1, limit: 500 }));
    const books: Book[] = (booksRes as any)?.items ?? [];
    this.booksAvail.set(books.filter(b => (b?.available ?? 0) > 0));

    // Solicitudes pendientes
    const reqs = await firstValueFrom(this.loansApi.listRequests());
    this.requests.set(Array.isArray(reqs) ? reqs : []);

    // Préstamos actuales
    const loansRes = await firstValueFrom(this.loansApi.list());
    this.loans.set(Array.isArray(loansRes) ? loansRes : []);
  }

  async createLoan() {
    if (!this.selectedUserId || !this.selectedBookId) return;
    this.loader.show();
    try {
      await firstValueFrom(this.loansApi.create({ userId: this.selectedUserId, bookId: this.selectedBookId }));
      await this.refreshAll();
      this.selectedBookId = null;
      this.toast.success('Préstamo creado');
    } catch (e: unknown) {
      this.toast.error('No se pudo crear el préstamo');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  async approve(l: Loan) {
    if (!l?._id) return;
    this.loader.show();
    try {
      await firstValueFrom(this.loansApi.approveRequest(l._id));
      await this.refreshAll();
      this.toast.success('Solicitud aprobada');
    } catch (e: unknown) {
      this.toast.error('No se pudo aprobar');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  async reject(l: Loan) {
    if (!l?._id) return;
    const reason = prompt('Motivo (opcional):') ?? undefined;
    this.loader.show();
    try {
      await firstValueFrom(this.loansApi.rejectRequest(l._id, reason));
      await this.refreshAll();
      this.toast.success('Solicitud rechazada');
    } catch (e: unknown) {
      this.toast.error('No se pudo rechazar');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  async returnLoan(l: Loan) {
    if (!l?._id || l.status !== 'active') return;
    this.loader.show();
    try {
      await firstValueFrom(this.loansApi.returnLoan(l._id));
      await this.refreshAll();
      this.toast.success('Libro devuelto');
    } catch (e: unknown) {
      this.toast.error('No se pudo devolver');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  trackByUser = (_: number, u: UserLight) => u.id!;
  trackByBook = (_: number, b: Book) => b._id!;
  trackByLoan = (_: number, l: Loan) => l._id!;
}

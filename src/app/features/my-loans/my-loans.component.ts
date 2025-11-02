import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LoansApi, Loan } from '../../core/loans.api';
import { LoaderService } from '../../shared/loader.service';
import { ToastService } from '../../shared/toast.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe, IconComponent],
  template: `
  <section class="card">
    <h2><app-icon name="book"></app-icon> Mis préstamos</h2>

    <div *ngIf="loading()" class="hint"><app-icon name="loader"></app-icon> Cargando…</div>
    <div *ngIf="!loading() && loans().length === 0" class="empty">
      <app-icon name="inbox"></app-icon>
      <p>No tienes préstamos registrados.</p>
    </div>

    <table *ngIf="!loading() && loans().length" class="table">
      <thead>
        <tr>
          <th>Libro</th>
          <th>Inicio</th>
          <th>Estado</th>
          <th>Devuelto</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of loans(); trackBy: trackByLoan">
          <td>{{ l.book?.title }}</td>
          <td>{{ l.startDate | date:'yyyy-MM-dd HH:mm' }}</td>
          <td>
            <span class="badge" [class.ok]="l.status==='active'" [class.muted]="l.status!=='active'">
              {{ l.status }}
            </span>
          </td>
          <td>{{ l.returnDate ? (l.returnDate | date:'yyyy-MM-dd HH:mm') : '—' }}</td>
        </tr>
      </tbody>
    </table>
  </section>
  `,
  styles: [`
    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
    .table{width:100%;border-collapse:separate;border-spacing:0 6px;margin-top:14px}
    th,td{padding:10px}
    thead th{color:var(--muted);font-weight:600;border-bottom:1px solid var(--border)}
    .badge{padding:2px 8px;border:1px solid var(--border);border-radius:999px}
    .badge.ok{background:#ecfdf5;border-color:#bbf7d0}
    .badge.muted{color:var(--muted)}
    .empty{display:flex;gap:8px;align-items:center;color:var(--muted);padding:8px}
    .hint{display:flex;gap:8px;align-items:center;color:var(--muted);padding:8px}
  `]
})
export class MyLoansComponent implements OnInit {
  private loansApi = inject(LoansApi);
  private loader = inject(LoaderService);
  private toast = inject(ToastService);

  loans = signal<Loan[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    this.loader.show();
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.loansApi.listMine());
      this.loans.set(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      this.toast.error('No se pudieron cargar tus préstamos');
    } finally {
      this.loader.hide();
      this.loading.set(false);
    }
  }

  trackByLoan = (_: number, l: Loan) => l._id;
}

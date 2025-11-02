import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../../shared/icon.component';

type TopItem = { bookId: string; title: string; activos: number };
type SummaryItem = { userId: string; status: 'active'|'returned'; count: number };

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, IconComponent],
  template: `
  <section class="dash">
    <header class="dash__header">
      <div class="title">
        <app-icon name="shield" [size]="22"></app-icon>
        <h1>Panel de Administración</h1>
      </div>
      <p class="muted">Indicadores rápidos de la biblioteca</p>
    </header>

    <div class="grid">
      <!-- Top 10 libros con activos -->
      <article class="card">
        <header class="card__header">
          <app-icon name="book"></app-icon>
          <h2>Top activos por libro</h2>
        </header>

        <ng-container *ngIf="loadingTop(); else topLoaded">
          <div class="skeleton" *ngFor="let _ of [1,2,3,4,5]"></div>
        </ng-container>

        <ng-template #topLoaded>
          <ol class="rank">
            <li *ngFor="let it of top(); let i = index">
              <span class="rank__idx">{{ i+1 }}</span>
              <div class="rank__text">
                <div class="rank__title">{{ it.title }}</div>
                <div class="bar">
                  <div class="bar__fill" [style.width.%]="barPercent(it.activos)"></div>
                </div>
              </div>
              <span class="rank__value">{{ it.activos }}</span>
            </li>
          </ol>
          <div *ngIf="!top().length" class="empty">
            <app-icon name="book"></app-icon>
            <span>No hay préstamos activos</span>
          </div>
        </ng-template>
      </article>

      <!-- Resumen por usuario -->
      <article class="card">
        <header class="card__header">
          <app-icon name="user"></app-icon>
          <h2>Resumen de préstamos por usuario</h2>
        </header>

        <ng-container *ngIf="loadingSum(); else sumLoaded">
          <div class="skeleton" *ngFor="let _ of [1,2,3,4]"></div>
        </ng-container>

        <ng-template #sumLoaded>
          <table class="table" *ngIf="rows().length; else emptySum">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Activos</th>
                <th>Devueltos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of rows()">
                <td>{{ r.userId }}</td>
                <td><span class="badge b-blue">{{ r.active }}</span></td>
                <td><span class="badge b-green">{{ r.returned }}</span></td>
                <td><strong>{{ r.total }}</strong></td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptySum>
            <div class="empty">
              <app-icon name="user"></app-icon>
              <span>Sin datos de préstamos</span>
            </div>
          </ng-template>
        </ng-template>
      </article>
    </div>
  </section>
  `,
  styles: [`
    .dash{display:flex;flex-direction:column;gap:16px}
    .dash__header .title{display:flex;align-items:center;gap:8px}
    .muted{color:var(--muted)}
    .grid{display:grid;grid-template-columns:1fr;gap:16px}
    @media (min-width:900px){ .grid{grid-template-columns:1fr 1fr} }

    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
    .card__header{display:flex;align-items:center;gap:8px;margin-bottom:10px}

    .rank{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
    .rank__idx{width:28px;height:28px;border-radius:50%;background:#eef2ff;display:grid;place-items:center;font-weight:700}
    .rank__text{flex:1;display:flex;flex-direction:column;gap:6px}
    .rank__title{font-weight:600}
    .rank__value{min-width:28px;text-align:right;font-variant-numeric:tabular-nums}

    .bar{height:8px;background:#f3f4f6;border-radius:999px;overflow:hidden}
    .bar__fill{height:100%;background:#6366f1}

    li{display:flex;align-items:center;gap:10px}

    .skeleton{height:16px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);border-radius:8px;animation: pulse 1.4s infinite}
    @keyframes pulse{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}

    .table{width:100%;border-collapse:collapse}
    .table th,.table td{padding:8px;border-bottom:1px solid var(--border);text-align:left}
    .badge{display:inline-flex;padding:2px 8px;border-radius:999px;font-variant-numeric:tabular-nums}
    .b-blue{background:#dbeafe}
    .b-green{background:#dcfce7}

    .empty{display:flex;gap:8px;align-items:center;color:var(--muted);padding:14px;border:1px dashed var(--border);border-radius:12px}
  `]
})
export class AdminDashboardComponent {
  private http = inject(HttpClient);

  // data signals
  top = signal<TopItem[]>([]);
  loadingTop = signal<boolean>(true);

  summary = signal<SummaryItem[]>([]);
  loadingSum = signal<boolean>(true);

  // vista agregada por usuario
  rows = computed(() => {
    const byUser = new Map<string, { active: number; returned: number }>();
    for (const s of this.summary()) {
      const cur = byUser.get(s.userId) ?? { active: 0, returned: 0 };
      if (s.status === 'active') cur.active += s.count;
      else cur.returned += s.count;
      byUser.set(s.userId, cur);
    }
    return Array.from(byUser.entries()).map(([userId, v]) => ({
      userId, active: v.active, returned: v.returned, total: v.active + v.returned
    }));
  });

  constructor(){
    this.fetchTop();
    this.fetchSummary();
  }

  private fetchTop(){
    this.loadingTop.set(true);
    this.http.get<TopItem[]>(`${environment.apiBase}/admin/top-active-books`)
      .subscribe({
        next: (data) => this.top.set(data),
        error: () => this.top.set([]),
        complete: () => this.loadingTop.set(false)
      });
  }

  private fetchSummary(){
    this.loadingSum.set(true);
    this.http.get<SummaryItem[]>(`${environment.apiBase}/admin/loans-summary`)
      .subscribe({
        next: (data) => this.summary.set(data),
        error: () => this.summary.set([]),
        complete: () => this.loadingSum.set(false)
      });
  }

  // barra: calculamos ancho relativo respecto al máximo
  barPercent(value: number): number {
    const max = Math.max(1, ...this.top().map(t => t.activos));
    return Math.round((value / max) * 100);
  }
}

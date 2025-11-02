import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Book } from './books.api';

export type LoanStatus = 'requested' | 'active' | 'returned' | 'rejected';

export interface LoanUserLite {
  id: string;
  name?: string;
  email?: string;
}

export interface Loan {
  _id: string;
  user?: LoanUserLite;
  book?: Book | { _id: string; title: string };
  status: LoanStatus;
  startDate?: string;
  dueDate?: string | null;
  returnDate?: string | null;
  decidedBy?: string | { _id: string; name?: string; email?: string };
  decidedAt?: string | null;
  decisionReason?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoansApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/loans`;

  /** Admin: todos los préstamos */
  list(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.base);
  }

  /** Estudiante: mis préstamos */
  listMine(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.base}/mine`);
  }

  /** Estudiante: solicitar préstamo */
  request(body: { bookId: string }): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/requests`, body);
  }

  /** Admin: listar solicitudes pendientes */
  listRequests(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.base}/requests`);
  }

  /** Admin: aprobar solicitud */
  approveRequest(id: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/requests/${id}/approve`, {});
  }

  /** Admin: rechazar solicitud (opcional reason) */
  rejectRequest(id: string, reason?: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/requests/${id}/reject`, { reason });
  }

  /** Admin: crear préstamo directo (salta “requested”) */
  create(body: { userId: string; bookId: string }): Observable<Loan> {
    return this.http.post<Loan>(this.base, body);
  }

  /** Admin: devolver préstamo activo */
  returnLoan(loanId: string): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/${loanId}/return`, {});
  }
}

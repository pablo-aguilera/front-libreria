import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Loan {
  _id: string;
  book: { _id: string; title: string };
  user: { _id: string; name: string; email: string };
  status: 'active' | 'returned';
  startDate: string;
  returnDate?: string;
}

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/loans`;

  // Admin: lista todos
  list() {
    return this.http.get<Loan[]>(this.base);
  }

  // Estudiante: mis préstamos (opcional filtrar por estado)
  my(status?: 'active' | 'returned') {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    // Asume endpoint /api/loans/mine en el backend
    return this.http.get<Loan[]>(`${this.base}/mine`, { params });
  }

  create(userId: string, bookId: string) {
    return this.http.post<Loan>(this.base, { userId, bookId });
  }

  return(id: string) {
    return this.http.post<Loan>(`${this.base}/${id}/return`, {});
  }
}

// src/app/core/books.api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Book {
  _id: string;
  title: string;
  author: string;
  year?: number;
  isbn?: string;
  copies?: number;
  available?: number;
}

interface ListResponse {
  items: Book[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class BooksApi {
  private http = inject(HttpClient);

  // 🔧 Usa la base del backend desde environment
  // Si usas proxy (proxy.conf.json), podrías cambiar esto a: '/api/books'
  private base = `${environment.apiBase}/books`;

  list(params: { q?: string; page?: number; limit?: number } = {}): Observable<ListResponse> {
    let p = new HttpParams();
    if (params.q) p = p.set('q', params.q);
    if (params.page) p = p.set('page', String(params.page));
    if (params.limit) p = p.set('limit', String(params.limit));
    return this.http.get<ListResponse>(this.base, { params: p });
  }

  /** Trae muchos libros y filtra los que tienen available > 0 */
  getAllAvailable(limit = 500): Observable<Book[]> {
    return this.list({ page: 1, limit }).pipe(
      map(res => (res.items ?? []).filter(b => (b.available ?? 0) > 0))
    );
  }
}

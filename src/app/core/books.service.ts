import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
export interface Book { _id: string; title: string; author: string; year?: number; copies: number; available: number; }
export interface BookList { items: Book[]; total: number; page: number; pages: number; }
@Injectable({ providedIn: 'root' })
export class BooksService {
  private api = inject(ApiService);
  list(q = '', page = 1, limit = 12) {
    const params: any = { page, limit }; if (q) params.q = q;
    return this.api.get<BookList>('/books', params);
  }
  create(b: Partial<Book>) { return this.api.post<Book>('/books', b); }
  update(id: string, b: Partial<Book>) { return this.api.put<Book>(`/books/${id}`, b); }
  remove(id: string) { return this.api.del<{ok: boolean}>(`/books/${id}`); }
}

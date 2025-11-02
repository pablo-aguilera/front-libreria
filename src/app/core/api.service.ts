// src/app/core/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = (environment.apiBase || '').replace(/\/+$/, ''); // sin slash final

  // Helper: une base y path con 1 solo slash
  private url(p: string): string {
    const path = (p || '').trim();
    const right = path.startsWith('/') ? path : `/${path}`;
    return `${this.base}${right}`;
  }

  // Helper: stringify seguro para logs
  private s(obj: any) {
    try { return JSON.stringify(obj); } catch { return String(obj); }
  }

  get<T>(p: string, params?: Record<string, any>) {
    const url = this.url(p);
    // HttpParams solo si viene params
    const options = params ? { params: new HttpParams({ fromObject: params }) } : {};
    console.log('[HTTP][GET]   =>', url, 'params:', this.s(params));
    return this.http.get<T>(url, options);
  }

  post<T>(p: string, body?: any, params?: Record<string, any>) {
    const url = this.url(p);
    const options = params ? { params: new HttpParams({ fromObject: params }) } : {};
    console.log('[HTTP][POST]  =>', url, 'body:', this.s(body), 'params:', this.s(params));
    return this.http.post<T>(url, body, options);
  }

  put<T>(p: string, body?: any, params?: Record<string, any>) {
    const url = this.url(p);
    const options = params ? { params: new HttpParams({ fromObject: params }) } : {};
    console.log('[HTTP][PUT]   =>', url, 'body:', this.s(body), 'params:', this.s(params));
    return this.http.put<T>(url, body, options);
  }

  patch<T>(p: string, body?: any, params?: Record<string, any>) {
    const url = this.url(p);
    const options = params ? { params: new HttpParams({ fromObject: params }) } : {};
    console.log('[HTTP][PATCH] =>', url, 'body:', this.s(body), 'params:', this.s(params));
    return this.http.patch<T>(url, body, options);
  }

  del<T>(p: string, params?: Record<string, any>) {
    const url = this.url(p);
    const options = params ? { params: new HttpParams({ fromObject: params }) } : {};
    console.log('[HTTP][DELETE]=>', url, 'params:', this.s(params));
    return this.http.delete<T>(url, options);
  }
}

import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService, AuthUser } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private base = `${environment.apiBase}/auth`;

  login(email: string, password: string) {
    return this.api
      .post<{ token: string; user: AuthUser }>(`${this.base}/login`, { email, password })
      .pipe(tap(r => this.auth.setAuth(r.token, r.user)));
  }

  register(
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'student' = 'student'
  ) {
    return this.api.post(`${this.base}/register`, { name, email, password, role });
  }
}

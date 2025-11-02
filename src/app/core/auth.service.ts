import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type Role = 'admin' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = new HttpClient({} as any); // será inyectado por Angular DI
  private router = {} as Router;            // idem (ver ctor)

  // --- Estado con Signals ---
  private state = signal<AuthState>({ token: null, user: null });

  // Signals “puros” (por si los quieres observar en componentes con .())
  private tokenSig = computed(() => this.state().token);
  private userSig = computed(() => this.state().user);
  private isLoggedInSig = computed(() => !!this.state().token && !!this.state().user);
  private roleSig = computed<Role | null>(() => this.userSig()?.role ?? null);

  constructor(http: HttpClient, router: Router) {
    // Proper DI
    this.http = http;
    this.router = router;

    // Restaurar sesión desde localStorage
    const raw = localStorage.getItem('auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        this.state.set(parsed);
      } catch {
        // si falla el parseo, limpiamos
        this.state.set({ token: null, user: null });
      }
    }

    // Persistir sesión automáticamente
    effect(() => {
      localStorage.setItem('auth', JSON.stringify(this.state()));
    });
  }

  // --- Métodos API de Autenticación ---
  /**
   * Inicia sesión contra la API y guarda token/usuario.
   * Redirección por rol la haces en el componente (ya lo tienes),
   * pero si quieres también podemos llamar navigate() aquí.
   */
  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${environment.apiBase}/auth/login`, { email, password })
      .pipe(
        map((res) => {
          this.setAuth(res.token, res.user);
          return res.user;
        })
      );
  }

  /**
   * Limpia sesión y redirige al login.
   */
  clear(): void {
    this.state.set({ token: null, user: null });
    localStorage.removeItem('auth');
    // Redirección automática al cerrar sesión
    this.router.navigate(['/login']);
  }

  // Atajo semántico por si prefieres
  logout(): void {
    this.clear();
  }

  /**
   * Setea el estado autenticado (usado internamente tras login).
   */
  setAuth(token: string, user: AuthUser): void {
    this.state.set({ token, user });
  }

  // --- Getters “compatibles con tu uso” (paréntesis) ---
  token(): string | null { return this.tokenSig(); }
  user(): AuthUser | null { return this.userSig(); }
  isLoggedIn(): boolean { return this.isLoggedInSig(); }
  role(): Role | null { return this.roleSig(); }
}

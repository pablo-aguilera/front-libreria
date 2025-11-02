import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/toast.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <section class="auth-page">
      <div class="card auth-card" role="form" aria-label="Iniciar sesión">
        <h2 class="title">
          <app-icon name="login"></app-icon> Iniciar sesión
        </h2>

        <form [formGroup]="form" (ngSubmit)="submit()" class="form" novalidate>
          <label class="row" for="email">
            <span>Correo</span>
            <input id="email" type="email" formControlName="email" required autocomplete="username" />
            <small class="err" *ngIf="form.controls.email.touched && form.controls.email.invalid">
              Ingresa un correo válido.
            </small>
          </label>

          <label class="row" for="pass">
            <span>Contraseña</span>
            <input id="pass" type="password" formControlName="password" required autocomplete="current-password" />
            <small class="err" *ngIf="form.controls.password.touched && form.controls.password.invalid">
              La contraseña es requerida.
            </small>
          </label>

          <button class="btn primary full" [disabled]="form.invalid || loading()">
            <ng-container *ngIf="!loading(); else loadingTpl">
              <app-icon name="login"></app-icon> Entrar
            </ng-container>
            <ng-template #loadingTpl>Ingresando…</ng-template>
          </button>
        </form>

        <div class="hint">
          Admin demo: <code>admin@demo.com</code> / <code>123456</code>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* --- CENTRADO VERTICAL & LAYOUT --- */
    .auth-page{
      min-height: calc(100dvh - 120px); /* ajusta si tu header/footer ocupa más/menos */
      display: grid;
      place-items: center;
      padding: 24px 12px;
      background: #f8fafc;
    }
    .card{
      background: var(--card, #fff);
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(15,23,42,.06);
    }
    .auth-card{
      width: 100%;
      max-width: 520px;
      padding: 20px 18px;
    }
    .title{
      display:flex; gap:8px; align-items:center;
      margin: 4px 0 12px; font-weight:700;
    }

    /* --- FORM --- */
    .form{ display:grid; gap:12px; }
    .row{ display:grid; gap:6px; }
    input{
      padding:10px 12px;
      border:1px solid var(--border, #e5e7eb);
      border-radius:10px;
      background:#fff;
    }
    .err{ color:#b91c1c; }

    .btn{
      display:inline-flex; align-items:center; gap:8px;
      border:1px solid var(--border, #e5e7eb);
      border-radius:10px; padding:10px 12px;
      background:#eef2ff; border-color:#e0e7ff; cursor:pointer;
    }
    .btn.primary{ background:#e0f2fe; border-color:#bae6fd; }
    .btn.full{ width:100%; justify-content:center; }

    .hint{
      margin-top:10px; color: var(--muted, #64748b); font-size:12px;
    }
    code{
      background:#f1f5f9; padding:2px 6px; border-radius:6px; border:1px solid #e2e8f0;
    }

    /* --- Modo oscuro opcional --- */
    :host-context(html.dark) .auth-page{ background:#0b1220; }
    :host-context(html.dark) .card{ background:#0f172a; border-color:#1e293b; }
    :host-context(html.dark) input{ background:#0b1220; color:#e2e8f0; border-color:#1e293b; }
    :host-context(html.dark) .hint{ color:#94a3b8; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    // si ya hay sesión, redirige al área correcta
    if (this.auth.isLoggedIn()) {
      const dest = this.auth.role() === 'admin' ? '/admin' : '/dashboard';
      this.router.navigate([dest]);
    }
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    const { email, password } = this.form.getRawValue();
    if (!email || !password) return;

    this.loading.set(true);
    this.auth.login(email, password).subscribe({
      next: () => {
        const role = this.auth.role();
        const dest = role === 'admin' ? '/admin' : '/dashboard';
        this.toast.success('Bienvenido');
        this.router.navigate([dest]);
      },
      error: () => {
        this.toast.error('Credenciales inválidas');
        this.form.controls.password.reset();
      },
      complete: () => this.loading.set(false),
    });
  }
}

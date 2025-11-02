import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { IconComponent } from './shared/icon.component';
import { ToastHostComponent } from './shared/toast.component';
import { LoaderComponent } from './shared/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent, ToastHostComponent, LoaderComponent],
  template: `
  <header class="topbar" role="banner">
    <div class="brand">
      <app-icon name="book" [size]="20"></app-icon>
      <span>Library</span>
    </div>

    <nav aria-label="Menú principal" class="menu">
      <!-- Público -->
      <a routerLink="/books" routerLinkActive="active"><app-icon name="book"></app-icon> <span>Libros</span></a>

      <!-- Área Usuario (student) -->
      <a *ngIf="auth.isLoggedIn() && auth.role()==='student'" routerLink="/dashboard" routerLinkActive="active">
        <app-icon name="user"></app-icon> <span>Mi Área</span>
      </a>
      <a *ngIf="auth.isLoggedIn() && auth.role()==='student'" routerLink="/my-loans" routerLinkActive="active">
        <app-icon name="shield"></app-icon> <span>Mis préstamos</span>
      </a>

      <!-- Perfil (cualquier rol autenticado) -->
      <a *ngIf="auth.isLoggedIn()" routerLink="/profile" routerLinkActive="active">
        <app-icon name="user"></app-icon> <span>Perfil</span>
      </a>

      <!-- Área Admin -->
      <a *ngIf="auth.role()==='admin'" routerLink="/admin" routerLinkActive="active">
        <app-icon name="shield"></app-icon> <span>Área Admin</span>
      </a>
      <a *ngIf="auth.role()==='admin'" routerLink="/admin/books" routerLinkActive="active">
        <app-icon name="book"></app-icon> <span>Admin Libros</span>
      </a>
      <a *ngIf="auth.role()==='admin'" routerLink="/admin/loans" routerLinkActive="active">
        <app-icon name="shield"></app-icon> <span>Admin Préstamos</span>
      </a>
      <!-- NUEVO: Admin Usuarios -->
      <a *ngIf="auth.role()==='admin'" routerLink="/admin/users" routerLinkActive="active">
        <app-icon name="user"></app-icon> <span>Admin Usuarios</span>
      </a>

      <span class="spacer"></span>

      <!-- Sesión -->
      <a *ngIf="!auth.isLoggedIn()" routerLink="/login" class="btn ghost">
        <app-icon name="login"></app-icon> <span>Login</span>
      </a>
      <div *ngIf="auth.isLoggedIn()" class="hello">
        Hola, {{auth.user()?.name}}
        <span class="role-badge">{{ auth.role()==='admin' ? 'Admin' : 'Estudiante' }}</span>
        <button class="btn danger" (click)="logout()">
          <app-icon name="logout"></app-icon> <span>Salir</span>
        </button>
      </div>
    </nav>
  </header>

  <main class="container"><router-outlet /></main>
  <footer class="foot">© Biblioteca — {{year}}</footer>

  <app-toast-host></app-toast-host>
  <app-loader></app-loader>
  `,
  styles: [`
    .topbar{position:sticky;top:0;z-index:10;background:var(--card);border-bottom:1px solid var(--border);
      display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 16px}
    .brand{display:flex;gap:8px;align-items:center;font-weight:700}
    .menu{display:flex;gap:10px;flex-wrap:wrap;align-items:center;width:100%}
    .menu a{display:flex;gap:6px;align-items:center;text-decoration:none;color:var(--fg);padding:6px 10px;border-radius:10px}
    .menu a:hover{background:#f3f4f6}
    .menu a.active{outline:2px solid #c7d2fe;border-radius:10px}
    .spacer{flex:1}
    .hello{display:flex;gap:10px;align-items:center}
    .role-badge{padding:2px 8px;border:1px solid var(--border);border-radius:999px;color:var(--muted);font-size:12px}
    .btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:10px;padding:6px 10px;
      background:var(--card);cursor:pointer}
    .btn.ghost{background:#eef2ff;border-color:#e0e7ff}
    .btn.danger{background:#fee2e2;border-color:#fecaca}
    .container{padding:16px;max-width:1080px;margin:0 auto}
    .foot{padding:16px;color:var(--muted);text-align:center}
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  year = new Date().getFullYear();
  logout(){ this.auth.clear(); }
}

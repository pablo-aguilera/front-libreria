import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';

@Component({
  standalone: true,
  selector: 'app-user-dashboard',
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <h1><app-icon name="user"></app-icon> Mi Área</h1>
    <p class="muted">Como estudiante puedes explorar libros y ver tus propios préstamos.</p>

    <div class="grid">
      <a class="card" routerLink="/books">
        <app-icon name="search" [size]="22"></app-icon>
        <div>
          <h3>Explorar Libros</h3>
          <p>Búsqueda y visualización.</p>
        </div>
      </a>

      <a class="card" routerLink="/my-loans">
        <app-icon name="shield" [size]="22"></app-icon>
        <div>
          <h3>Mis Préstamos</h3>
          <p>Solo ves tus préstamos activos y devueltos.</p>
        </div>
      </a>

      <a class="card" routerLink="/profile">
        <app-icon name="user" [size]="22"></app-icon>
        <div>
          <h3>Mi Perfil</h3>
          <p>Datos básicos de tu cuenta.</p>
        </div>
      </a>
    </div>
  `,
  styles: [`
    .muted{color:var(--muted)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:10px}
    .card{display:flex;gap:10px;align-items:center;border:1px solid var(--border);border-radius:14px;
      padding:14px;text-decoration:none;background:var(--card);color:inherit}
    .card:hover{box-shadow:0 6px 18px rgba(2,6,23,.08)}
    h3{margin:0 0 4px 0}
    p{margin:0}
  `]
})
export class UserDashboardComponent {}

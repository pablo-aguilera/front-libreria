// src/app/features/users-admin/users-admin.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { UsersApi, UserLight, Role } from '../../core/users.api';
import { LoaderService } from '../../shared/loader.service';
import { ToastService } from '../../shared/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { ApiService } from '../../core/api.service';

type UserRow = UserLight & { createdAt?: string };

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
  <section class="card">
    <h2><app-icon name="user"></app-icon> Admin Usuarios</h2>

    <div class="grid">
      <label>
        <span>Filtrar por rol</span>
        <select [(ngModel)]="roleFilter" (change)="load()">
          <option [ngValue]="''">Todos</option>
          <option [ngValue]="'student'">Estudiantes</option>
          <option [ngValue]="'admin'">Admins</option>
        </select>
      </label>
    </div>

    <!-- Crear -->
    <form #f="ngForm" (ngSubmit)="create(f)" class="create" novalidate>
      <h3><app-icon name="plus"></app-icon> Crear usuario</h3>
      <div class="row">
        <label>Nombre
          <input name="name" [(ngModel)]="newUser.name" required />
        </label>
        <label>Email
          <input name="email" type="email" [(ngModel)]="newUser.email" required />
        </label>
        <label>Password
          <input name="password" type="password" [(ngModel)]="newUser.password" required minlength="6" />
        </label>
        <label>Rol
          <select name="role" [(ngModel)]="newUser.role" required>
            <option [ngValue]="'student'">student</option>
            <option [ngValue]="'admin'">admin</option>
          </select>
        </label>
        <button class="btn primary" [disabled]="f.invalid">
          <app-icon name="plus"></app-icon> Crear
        </button>
      </div>
    </form>

    <!-- Tabla -->
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th><th>Email</th><th>Rol</th><th>Creado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users(); trackBy: trackByUser">
          <!-- Nombre -->
          <td>
            <ng-container *ngIf="editingId !== u.id; else editName">
              {{ u.name }}
            </ng-container>
            <ng-template #editName>
              <input [(ngModel)]="editModel.name" name="name-{{u.id}}" />
            </ng-template>
          </td>

          <!-- Email -->
          <td>
            <ng-container *ngIf="editingId !== u.id; else editEmail">
              {{ u.email }}
            </ng-container>
            <ng-template #editEmail>
              <input [(ngModel)]="editModel.email" name="email-{{u.id}}" type="email" />
            </ng-template>
          </td>

          <!-- Rol (si está en modo edición, igual permitimos cambiarlo aquí) -->
          <td>
            <ng-container *ngIf="editingId !== u.id; else editRole">
              <select [(ngModel)]="u.role" (ngModelChange)="updateRole(u, $event)">
                <option [ngValue]="'student'">student</option>
                <option [ngValue]="'admin'">admin</option>
              </select>
            </ng-container>
            <ng-template #editRole>
              <select [(ngModel)]="editModel.role" name="role-{{u.id}}">
                <option [ngValue]="'student'">student</option>
                <option [ngValue]="'admin'">admin</option>
              </select>
            </ng-template>
          </td>

          <!-- Creado -->
          <td>{{ u.createdAt ? (u.createdAt | date:'yyyy-MM-dd HH:mm') : '—' }}</td>

          <!-- Acciones -->
          <td class="actions">
            <ng-container *ngIf="editingId !== u.id; else editingBtns">
              <button class="btn" (click)="startEdit(u)">
                <app-icon name="edit"></app-icon> Editar
              </button>
              <button class="btn danger" (click)="remove(u)">
                <app-icon name="trash"></app-icon> Eliminar
              </button>
            </ng-container>

            <ng-template #editingBtns>
              <input type="password" placeholder="(opcional) nuevo password"
                     [(ngModel)]="editModel.password" name="pwd-{{u.id}}" class="pwd" />
              <button class="btn primary" (click)="saveEdit(u)">
                <app-icon name="check"></app-icon> Guardar
              </button>
              <button class="btn" (click)="cancelEdit()">
                <app-icon name="close"></app-icon> Cancelar
              </button>
            </ng-template>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  `,
  styles: [`
    .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;align-items:end;margin-bottom:12px}
    label{display:flex;flex-direction:column;gap:6px}
    input,select{padding:8px;border:1px solid var(--border);border-radius:8px;background:white}
    .create{margin:12px 0;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--card)}
    .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;align-items:end}
    .btn{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--border);border-radius:10px;padding:6px 10px;background:var(--card);cursor:pointer}
    .btn.primary{background:#e0f2fe;border-color:#bae6fd}
    .btn.danger{background:#fee2e2;border-color:#fecaca}
    .table{width:100%;border-collapse:separate;border-spacing:0 6px;margin-top:14px}
    th,td{padding:10px;vertical-align:middle}
    thead th{color:var(--muted);font-weight:600;border-bottom:1px solid var(--border)}
    .actions{display:flex;gap:8px;align-items:center}
    .pwd{min-width:180px}
  `]
})
export class UsersAdminComponent implements OnInit {
  private usersApi = inject(UsersApi);
  private api = inject(ApiService);          // usa environment.apiBase
  private loader = inject(LoaderService);
  private toast = inject(ToastService);

  users = signal<UserRow[]>([]);
  roleFilter: '' | Role = '';

  // Crear
  newUser: { name: string; email: string; password: string; role: Role } = {
    name: '', email: '', password: '', role: 'student'
  };

  // Editar
  editingId: string | null = null;
  editModel: { name: string; email: string; role: Role; password?: string } = {
    name: '', email: '', role: 'student', password: ''
  };

  ngOnInit() { this.load(); }

  async load() {
    this.loader.show();
    try {
      const list = await (this.roleFilter
        ? this.usersApi.list(this.roleFilter).toPromise()
        : this.usersApi.list().toPromise());
      this.users.set((list || []) as UserRow[]);
    } catch (e) {
      this.toast.error('No se pudieron cargar usuarios');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  // Crear
  async create(form: NgForm) {
    if (form.invalid) return;
    this.loader.show();
    try {
      await this.api.post<UserRow>('/users', this.newUser).toPromise();
      this.toast.success('Usuario creado');
      form.resetForm({ role: 'student' });
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.error?.error || 'No se pudo crear el usuario');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  // Empezar edición
  startEdit(u: UserRow) {
    this.editingId = u.id;
    this.editModel = { name: u.name, email: u.email, role: u.role, password: '' };
  }

  // Guardar edición (PUT /users/:id). password es opcional.
  async saveEdit(u: UserRow) {
    if (!this.editingId) return;
    this.loader.show();
    try {
      const patch: any = {
        name: (this.editModel.name || '').trim(),
        email: (this.editModel.email || '').trim(),
        role: this.editModel.role
      };
      if (this.editModel.password && this.editModel.password.length >= 6) {
        patch.password = this.editModel.password;
      }
      await this.api.put<UserRow>(`/users/${u.id}`, patch).toPromise();
      this.toast.success('Usuario actualizado');
      this.cancelEdit();
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.error?.error || 'No se pudo actualizar');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editModel = { name: '', email: '', role: 'student', password: '' };
  }

  // Cambiar solo el rol (usamos también PUT /users/:id con { role } para no depender de PATCH)
  async updateRole(u: UserRow, role: Role) {
    this.loader.show();
    try {
      await this.api.put(`/users/${u.id}`, { role }).toPromise();
      this.toast.success('Rol actualizado');
    } catch (e: any) {
      this.toast.error(e?.error?.error || 'No se pudo actualizar el rol');
      console.error(e);
      await this.load(); // revertir UI
    } finally {
      this.loader.hide();
    }
  }

  // Eliminar
  async remove(u: UserRow) {
    if (!confirm(`¿Eliminar a "${u.name}"?`)) return;
    this.loader.show();
    try {
      await this.api.del(`/users/${u.id}`).toPromise();
      this.toast.success('Usuario eliminado');
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.error?.error || 'No se pudo eliminar');
      console.error(e);
    } finally {
      this.loader.hide();
    }
  }

  trackByUser = (_: number, u: UserRow) => u.id;
}

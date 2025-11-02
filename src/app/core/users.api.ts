// src/app/core/users.api.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type Role = 'admin' | 'student';

export interface UserLight {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string; // opcional para mostrar en la tabla
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/users`;

  /** Listado; si pasas role = 'student' filtra en el backend (si no, trae todos) */
  list(role?: Role) {
    const url = role ? `${this.base}?role=${role}` : this.base;
    return this.http.get<UserLight[]>(url);
  }

  /** Crear usuario (admin) */
  create(body: { name: string; email: string; password: string; role: Role }) {
    return this.http.post<UserLight>(this.base, body);
  }

  /** Actualizar usuario (admin) — puedes mandar cualquier subset: name/email/role/password */
  update(id: string, patch: Partial<{ name: string; email: string; role: Role; password: string }>) {
    return this.http.put<UserLight>(`${this.base}/${id}`, patch);
  }

  /** Atajo para actualizar solo el rol */
  updateRole(id: string, role: Role) {
    return this.http.patch<UserLight>(`${this.base}/${id}/role`, { role });
  }

  /** Eliminar usuario (admin) */
  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }
}

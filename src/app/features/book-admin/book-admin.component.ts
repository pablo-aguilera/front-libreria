import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { BooksService, Book } from '../../core/books.service';
import { InputErrorComponent } from '../../shared/input-error.component';
import { BookCardComponent } from '../../shared/book-card.component';
import { IconComponent } from '../../shared/icon.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  standalone: true,
  selector: 'app-book-admin',
  imports: [
    CommonModule,        // ⬅️ para pipes y utilidades base
    NgIf, NgFor,         // ⬅️ directivas standalone (evita el warning)
    ReactiveFormsModule,
    InputErrorComponent,
    BookCardComponent,
    IconComponent
  ],
  template: `
  <h1><app-icon name="shield"></app-icon> Admin Libros</h1>

  <form [formGroup]="form" (ngSubmit)="save()" novalidate aria-label="Formulario de libro" class="form">
    <div class="row">
      <label for="t">Título</label>
      <input id="t" formControlName="title" aria-required="true"/>
      <app-input-error [control]="form.controls.title"></app-input-error>
    </div>
    <div class="row">
      <label for="a">Autor</label>
      <input id="a" formControlName="author" aria-required="true"/>
      <app-input-error [control]="form.controls.author"></app-input-error>
    </div>
    <div class="row small">
      <label for="y">Año</label>
      <input id="y" type="number" formControlName="year"/>
    </div>
    <div class="row small">
      <label for="c">Copias</label>
      <input id="c" type="number" formControlName="copies"/>
      <app-input-error [control]="form.controls.copies"></app-input-error>
    </div>
    <div class="row small">
      <label for="v">Disponibles</label>
      <input id="v" type="number" formControlName="available"/>
      <app-input-error [control]="form.controls.available"></app-input-error>
    </div>

    <div class="actions">
      <button class="btn" [disabled]="form.invalid">
        <app-icon [name]="editingId ? 'edit' : 'plus'"></app-icon>
        {{ editingId ? 'Actualizar' : 'Crear' }}
      </button>
      <button type="button" (click)="cancel()" *ngIf="editingId" class="btn danger">
        Cancelar
      </button>
    </div>
  </form>

  <div class="list">
    <app-book-card *ngFor="let b of items()" [book]="b">
      <div class="admin-actions">
        <button class="btn" (click)="edit(b)"><app-icon name="edit"></app-icon> Editar</button>
        <button class="btn danger" (click)="remove(b)"><app-icon name="trash"></app-icon> Eliminar</button>
      </div>
    </app-book-card>
  </div>
  `,
  styles: [`
    .form{display:grid;grid-template-columns:2fr 2fr 1fr 1fr 1fr;gap:10px;align-items:start;margin-bottom:12px;background:var(--card);padding:12px;border:1px solid var(--border);border-radius:14px}
    .row{display:flex;flex-direction:column;gap:6px}
    .row.small input{max-width:120px}
    .actions{display:flex;gap:8px;align-items:center}
    .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .admin-actions{display:flex;gap:8px;margin-top:8px}
    .btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:10px;padding:6px 10px;background:var(--card);cursor:pointer}
    .btn.danger{background:#fee2e2;border-color:#fecaca}
    @media (max-width:900px){ .form{grid-template-columns:1fr 1fr} .row.small input{max-width:none} }
  `]
})
export class BookAdminComponent {
  private api = inject(BooksService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  items = signal<Book[]>([]);
  editingId: string | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    year: [null as number | null],
    copies: [1 as number | null, [Validators.required, Validators.min(0)]],
    available: [1 as number | null, [Validators.required, Validators.min(0)]],
  });

  constructor(){
    this.load();
  }

  load(){
    this.api.list('', 1, 100).subscribe({
      next: r => this.items.set(r.items),
      error: () => this.toast.error('No se pudieron cargar los libros')
    });
  }

  edit(b: Book){
    this.editingId = b._id;
    this.form.patchValue({
      title: b.title,
      author: b.author,
      year: b.year ?? null,
      copies: b.copies,
      available: b.available
    });
  }

  cancel(){
    this.editingId = null;
    this.form.reset({ title:'', author:'', year:null, copies:1, available:1 });
  }

  save(){
    const raw = this.form.getRawValue();
    const payload: Partial<Book> = {
      title: (raw.title ?? '').toString(),
      author: (raw.author ?? '').toString(),
      year: raw.year ?? undefined,
      copies: raw.copies != null ? Number(raw.copies) : 0,
      available: raw.available != null ? Number(raw.available) : 0
    };

    const op = this.editingId
      ? this.api.update(this.editingId, payload)
      : this.api.create(payload);

    op.subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Libro actualizado' : 'Libro creado');
        this.cancel();
        this.load();
      },
      error: () => this.toast.error('No se pudo guardar el libro')
    });
  }

  remove(b: Book){
    if(!confirm(`Eliminar "${b.title}"?`)) return;
    this.api.remove(b._id).subscribe({
      next: () => { this.toast.success('Libro eliminado'); this.load(); },
      error: () => this.toast.error('No se pudo eliminar')
    });
  }
}

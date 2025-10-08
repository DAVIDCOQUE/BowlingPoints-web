import { Component, TemplateRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.component.html',
  styleUrls: ['./clubes.component.css']
})
export class ClubesComponent implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  readonly auth = inject(AuthService);

  public apiUrl = environment.apiUrl;

  // UI State
  filter = '';
  id_Club?: number;

  clubes: IClubs[] = [];
  usuarios: IUser[] = [];

  clubForm!: FormGroup;

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.buildForm();
    this.getClubes();
    this.getUsers();
  }

  /** Construye el formulario del club */
  private buildForm(): void {
    this.clubForm = this.fb.group({
      name: ['', Validators.required],
      foundationDate: ['', Validators.required],
      city: ['', Validators.required],
      description: ['', Validators.required],
      status: [true, Validators.required],
      members: ['', Validators.required],
      imageUrl: ['']
    });
  }

  /** Obtiene todos los clubes con sus miembros */
  getClubes(): void {
    this.http.get<IClubs[]>(`${this.apiUrl}/clubs/with-members`)
      .subscribe({
        next: clubs => {
          this.clubes = clubs;
        },
        error: err => {
          console.error('❌ Error al cargar clubes:', err);
          Swal.fire('Error', 'No se pudieron cargar los clubes', 'error');
        }
      });
  }

  /** Filtro de búsqueda */
  get filteredClubes(): IClubs[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.clubes.filter(club => club.name.toLowerCase().includes(term))
      : this.clubes;
  }

  /** Obtiene los usuarios del sistema */
  getUsers(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${this.apiUrl}/users`)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
        },
        error: err => {
          console.error('❌ Error al cargar usuarios:', err);
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
      });
  }

  /** Crea o actualiza un club */
  save(): void {
    if (this.clubForm.invalid) {
      Swal.fire('Formulario inválido', 'Revisa los campos requeridos', 'warning');
      return;
    }

    const raw = this.clubForm.value;

    // Transformar IDs a objetos
    const members = (raw.members || []).map((id: number) => ({
      personId: id,
      roleInClub: 'ENTRENADOR'
    }));

    // Validar duplicados
    const seen = new Set<number>();
    const hasDuplicate = members.some((m: { personId: number; roleInClub: string }) => {
      if (seen.has(m.personId)) return true;
      seen.add(m.personId);
      return false;
    });

    if (hasDuplicate) {
      Swal.fire('Atención', 'Hay miembros repetidos en el club.', 'warning');
      return;
    }

    const payload = { ...raw, members };

    const url = this.id_Club
      ? `${this.apiUrl}/clubs/${this.id_Club}`
      : `${this.apiUrl}/clubs/create-with-members`;

    const request$ = this.id_Club
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => {
        const msg = this.id_Club ? 'actualizado' : 'creado';
        Swal.fire('Éxito', `El club fue ${msg} correctamente`, 'success');
        this.getClubes();
        this.closeModal();
      },
      error: err => {
        const msg = err?.error?.message?.includes('asignado a este club')
          ? 'Este miembro ya pertenece a otro club.'
          : 'No se pudo guardar el club';

        Swal.fire('Error', msg, 'error');
        console.error('❌ Error al guardar club:', err);
      }
    });
  }

  /** Elimina un club con confirmación */
  deleteClub(id_Club: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/clubs/${id_Club}`).subscribe({
          next: () => {
            this.getClubes();
            Swal.fire('Eliminado', 'El club ha sido eliminado', 'success');
          },
          error: err => {
            console.error('❌ Error al eliminar club:', err);
            Swal.fire('Error', 'No se pudo eliminar el club', 'error');
          }
        });
      }
    });
  }

  /** Abre modal para crear/editar club */
  openModal(content: TemplateRef<unknown>, club?: IClubs): void {
    if (club) {
      this.id_Club = club.clubId;
      const memberIds = (club.members || []).map(m => m.personId);
      this.clubForm.patchValue({
        ...club,
        members: memberIds,
        imageUrl: club.imageUrl
      });
    } else {
      this.id_Club = undefined;
      this.clubForm.reset({ status: true });
    }

    this.modalService.open(content);
  }

  /** Cierra todos los modales activos */
  closeModal(): void {
    this.modalService.dismissAll();
  }

  /** Limpia el filtro y recarga clubes */
  clear(): void {
    this.filter = '';
    this.getClubes();
  }

  /** Maneja error al cargar imagen */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

}

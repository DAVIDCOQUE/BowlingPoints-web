import { Component, OnInit, TemplateRef, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit, OnDestroy {

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly auth = inject(AuthService);

  public apiUrl = environment.apiUrl;

  private userSub?: Subscription;
  public usuariosLoaded = false;

  // UI State

  filter = '';
  clubForm!: FormGroup;
  miClub: IClubs | null = null;
  id_Club?: number;
  clubId: number | null = null;

  // Data
  usuarios: IUser[] = [];
  miembros: IUser[] = [];

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.buildForm();

    this.userSub = this.auth.user$.subscribe(user => {
      if (user?.clubId) {
        this.clubId = user.clubId;
        this.getMiClub();
      } else {
        this.miClub = null;
        this.clubId = null;
        Swal.fire('Sin Club', 'No tienes un club asociado', 'info');
      }
    });

    this.getUsers();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  /** Crea el formulario reactivo del club */
  public buildForm(): void {
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

  /** Carga los datos del club asociado al usuario */
  getMiClub(): void {
    if (!this.clubId) {
      this.miClub = null;
      return;
    }

    this.http.get<IClubs>(`${this.apiUrl}/clubs/${this.clubId}/details`)
      .subscribe({
        next: club => {
          this.miClub = club;
        },
        error: () => {
          this.miClub = null;
          Swal.fire('Error', 'No se pudieron cargar los datos de tu club', 'error');
        }
      });
  }

  /** Obtiene la lista de usuarios (una sola vez) */
  getUsers(forceRefresh: boolean = false): void {
    if (this.usuariosLoaded && !forceRefresh) return;

    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${this.apiUrl}/users`)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
          this.usuariosLoaded = true;
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
      });
  }

  /** Guarda o actualiza un club */
  save(): void {
    if (this.clubForm.invalid) {
      Swal.fire('Atención', 'Formulario inválido', 'warning');
      return;
    }

    const raw = this.clubForm.value;

    const members = (raw.members || []).map((id: number) => ({
      personId: id,
      roleInClub: 'ENTRENADOR'
    }));

    // Validación: No permitir miembros duplicados
    const seen = new Set<number>();
    for (const m of members) {
      if (seen.has(m.personId)) {
        Swal.fire('Error', 'No puedes agregar el mismo miembro dos veces.', 'error');
        return;
      }
      seen.add(m.personId);
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
        this.closeModal();
        if (this.clubId) this.getMiClub();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el club', 'error');
      }
    });
  }

  /** Elimina un club */
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
            Swal.fire('Eliminado', 'El club ha sido eliminado', 'success');
            this.miClub = null;
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el club', 'error');
          }
        });
      }
    });
  }

  /** Abre el modal de edición/creación del club */
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

  /** Cierra todos los modales abiertos */
  closeModal(): void {
    this.modalService.dismissAll();
  }

  /** Limpia el campo de búsqueda */
  clear(): void {
    this.filter = '';
  }

  /** Maneja error al cargar imagen */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  // --- Helpers de vista para miClub ---

  showRanking(): boolean {
    return typeof this.miClub?.ranking === 'number' && this.miClub.ranking > 0;
  }

  showScore(): boolean {
    return typeof this.miClub?.score === 'number' && !isNaN(this.miClub.score);
  }

  hasLogros(): boolean {
    if (!this.miClub) return false;
    return Array.isArray(this.miClub.logros) && this.miClub.logros.length > 0;
  }

  hasTorneos(): boolean {
    if (!this.miClub) return false;
    return Array.isArray(this.miClub.torneos) && this.miClub.torneos.length > 0;
  }

  hasMembers(): boolean {
    if (!this.miClub) return false;
    return Array.isArray(this.miClub.members) && this.miClub.members.length > 0;
  }
}

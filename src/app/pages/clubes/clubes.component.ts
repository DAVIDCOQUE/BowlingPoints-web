import { Component, OnInit, TemplateRef } from '@angular/core';
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

  public apiUrl = environment.apiUrl;

  id_Club?: number;
  filter: string = '';

  clubes: IClubs[] = [];
  usuarios: IUser[] = [];
  miembros: any[] = [];

  clubForm!: FormGroup;

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getClubes();
    this.getUsers();
  }

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

  getClubes(): void {
    this.http.get<IClubs[]>(`${environment.apiUrl}/clubs/with-members`)
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

    get filteredClubes(): IClubs[] {
      const term = this.filter.toLowerCase().trim();
      return term
        ? this.clubes.filter(cat => cat.name.toLowerCase().includes(term))
        : this.clubes;
    }


  getUsers(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${environment.apiUrl}/users`,)
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

  save(): void {
    if (this.clubForm.invalid) {
      console.warn('⚠️ Formulario inválido');
      return;
    }

    const raw = this.clubForm.value;

    // Transforma los miembros seleccionados en objetos con personId + rol
    const members = (raw.members || []).map((id: number) => ({
      personId: id,
      roleInClub: 'ENTRENADOR'
    }));

    // VALIDACIÓN: Verifica miembros duplicados por personId
    const seen = new Set<number>();
    const hasDuplicate = members.some((m: { personId: number; roleInClub: string }) => {
      if (seen.has(m.personId)) {
        return true;
      }
      seen.add(m.personId);
      return false;
    });

    if (hasDuplicate) {
      Swal.fire('Atención', 'Hay miembros repetidos en el club. Por favor revisa la selección.', 'warning');
      return;
    }

    const payload = {
      ...raw,
      members
    };

    const url = this.id_Club
      ? `${environment.apiUrl}/clubs/${this.id_Club}`
      : `${environment.apiUrl}/clubs/create-with-members`;

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
        if (err?.error?.message?.includes('asignado a este club')) {
          Swal.fire('Atención', 'Este miembro ya pertenece al club.', 'warning');
        } else {
          Swal.fire('Error', 'No se pudo guardar el club', 'error');
        }
        console.error('❌ Error al guardar club:', err);
      }
    });
  }

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


        this.http.delete(`${environment.apiUrl}/clubs/${id_Club}`,).subscribe({
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

  openModal(content: TemplateRef<any>, club?: IClubs): void {
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

  closeModal(): void {
    this.modalService.dismissAll();
  }

  clear(): void {
    this.filter = '';
    this.getClubes();
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

}

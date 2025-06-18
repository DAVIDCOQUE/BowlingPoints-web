import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Clubs } from 'src/app/interface/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.component.html',
  styleUrls: ['./clubes.component.css']
})
export class ClubesComponent implements OnInit {

  clubForm!: FormGroup;
  clubes: Clubs[] = [];
  usuarios: IUser[] = [];
  miembros: any[] = [];

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  id_Club?: number;
  filter: string = '';

  public apiUrl = environment.apiUrl;
  // Cache para evitar recargas innecesarias
  private clubesLoaded = false;
  private usuariosLoaded = false;

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

  // 🔁 Obtener clubes con cacheo y logs
  getClubes(forceRefresh: boolean = false): void {
    if (this.clubesLoaded && !forceRefresh) {
      console.log('✅ Clubes cargados desde caché');
      return;
    }



    this.http.get<Clubs[]>(`${environment.apiUrl}/clubs/with-members`)
      .subscribe({
        next: clubs => {
          console.log('📦 Clubes recibidos:', clubs);
          this.clubes = clubs;
          this.clubesLoaded = true;
        },
        error: err => {
          console.error('❌ Error al cargar clubes:', err);
          Swal.fire('Error', 'No se pudieron cargar los clubes', 'error');
        }
      });
  }

  // 🔁 Obtener usuarios
  getUsers(forceRefresh: boolean = false): void {
    if (this.usuariosLoaded && !forceRefresh) {
      console.log('✅ Usuarios cargados desde caché');
      return;
    }
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${environment.apiUrl}/users`,)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
          this.usuariosLoaded = true;
          console.log('👤 Usuarios recibidos:', this.usuarios);
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

    // ✅ Transformar members (array de IDs) en objetos con personId + rol
    const members = (raw.members || []).map((id: number) => ({
      personId: id,
      roleInClub: 'ENTRENADOR' // Rol fijo por ahora
    }));

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

    console.log('📤 Enviando datos:', payload);

    request$.subscribe({
      next: () => {
        const msg = this.id_Club ? 'actualizado' : 'creado';
        Swal.fire('Éxito', `El club fue ${msg} correctamente`, 'success');
        this.getClubes(true);
        this.closeModal();
      },
      error: err => {
        console.error('❌ Error al guardar club:', err);
        Swal.fire('Error', 'No se pudo guardar el club', 'error');
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
            this.getClubes(true);
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

  openModal(content: TemplateRef<any>, club?: Clubs): void {
    if (club) {
      this.id_Club = club.clubId;

      // Obtener los IDs de los miembros
      const memberIds = (club.members || []).map(m => m.personId);

      // Aplicar datos al formulario
      this.clubForm.patchValue({
        ...club,
        members: memberIds,  // ✅ Asignar los IDs directamente al campo "members"
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

  search(): void {
    const term = this.filter.toLowerCase().trim();
    this.getClubes(); // vuelve a cargar por si borraste antes
    this.clubes = this.clubes.filter(c => c.name.toLowerCase().includes(term));
  }

  clear(): void {
    this.filter = '';
    this.getClubes(true); // recargar limpia
  }

}

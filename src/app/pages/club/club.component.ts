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
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent {

  clubForm!: FormGroup;
  miClub: Clubs | null = null;
  usuarios: IUser[] = [];
  miembros: any[] = [];

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  club = {

    ranking: 3,
    puntaje: 2475,
    logros: [
      'Campeón Nacional 2021',
      'Subcampeón Liga Suramericana 2022',
      '3er lugar Juegos Interligas 2020',
    ],

    torneos: [
      { nombre: 'Torneo Nacional Sub 21', fecha: '2023-05-12', posicion: '1º', puntaje: 750 },
      { nombre: 'Liga de Verano', fecha: '2022-08-22', posicion: '3º', puntaje: 620 },
    ],
  }
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
  ) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.userId;
  }

  ngOnInit(): void {
    this.buildForm();
    this.getMiClub();
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

  // 🔁 Obtener clube con cacheo y logs
  getMiClub(): void {
    // Obtener el clubId del usuario logueado desde localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clubId = user.clubId;

    if (!clubId) {
      Swal.fire('Sin Club', 'No tienes un club asociado', 'info');
      return;
    }

    // Ahora consulta los detalles del club
    this.http.get<Clubs>(`${environment.apiUrl}/clubs/${clubId}/details`)
      .subscribe({
        next: club => {
          console.log('🏟️ Detalles del club:', club);
          this.miClub = club;
        },
        error: err => {
          console.error('❌ Error al cargar tu club:', err);
          Swal.fire('Error', 'No se pudieron cargar los datos de tu club', 'error');
        }
      });
  }

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
          console.log('👤 Usuarios recibidos:', res);
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
  }

  clear(): void {
    this.filter = '';
  }

}

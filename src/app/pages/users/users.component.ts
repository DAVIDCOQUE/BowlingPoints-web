import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';
import { UserApiService } from 'src/app/services/user-api.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild('modalUser') modalUserRef!: TemplateRef<unknown>;

  /** Filtro de búsqueda */
  filter = '';

  /** Listado de usuarios */
  usuarios: IUser[] = [];

  /** Listado de roles */
  roles: IRole[] = [];

  /** Lista de géneros disponibles */
  genders: string[] = ['Masculino', 'Femenino'];

  /** ID del usuario en edición */
  idUser: number | null = null;

  /** Formulario reactivo de usuario */
  userForm: FormGroup = new FormGroup({});

  /** Indicadores de visibilidad de contraseña */
  showPassword = false;
  showConfirmPassword = false;

  /** Indicador de carga */
  loading = false;

  /** Inyecciones mediante inject() */
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly userApi = inject(UserApiService);
  private readonly authService = inject(AuthService);

  /**
   * Hook de inicialización
   */
  ngOnInit(): void {
    this.initForm();
    this.getUsers();
    this.getRoles();
  }

  get apiUrl(): string {
    return this.authService.baseUrl;
  }

  /**
   * Inicializa el formulario reactivo
   */
  initForm(): void {
    this.userForm = this.formBuilder.group({
      nickname: ['', Validators.required],
      photoUrl: [''],
      document: ['', Validators.required],
      fullName: ['', Validators.required],
      fullSurname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      roleId: ['', Validators.required],
      password: [''],
      confirm: ['']
    });
  }

  /**
   * Obtiene todos los usuarios desde la API
   */
  getUsers(): void {
    this.userApi.getUsers().subscribe({
      next: res => this.usuarios = res,
      error: err => console.error('Error al cargar usuarios:', err)
    });
  }

  /**
   * Obtiene todos los roles desde la API
   */
  getRoles(): void {
    this.userApi.getRoles().subscribe({
      next: res => this.roles = res,
      error: err => console.error('Error al cargar roles:', err)
    });
  }

  /**
   * Devuelve usuarios filtrados por término de búsqueda
   */
  get usuariosFiltrados(): IUser[] {
    const term = this.filter.toLowerCase().trim();
    if (!term) return this.usuarios;

    return this.usuarios.filter(user =>
      user.nickname.toLowerCase().includes(term) ||
      user.fullName.toLowerCase().includes(term) ||
      user.fullSurname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.roleDescription.toLowerCase().includes(term) ||
      user.gender.toLowerCase().includes(term)
    );
  }

  /**
   * Abre el modal con datos precargados para editar un usuario
   */
  editUser(user: IUser): void {
    this.idUser = user.userId;

    this.userForm.patchValue({
      nickname: user.nickname,
      document: user.document,
      photoUrl: user.photoUrl || '',
      email: user.email,
      fullName: user.fullName,
      fullSurname: user.fullSurname,
      phone: user.phone,
      gender: user.gender,
      roleId: this.getRoleIdByDescription(user.roleDescription),
      password: '',
      confirm: ''
    });

    this.openModal(this.modalUserRef);
  }

  /**
   * Guarda el formulario (crea o actualiza un usuario)
   */
  saveForm(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const isEdit = !!this.idUser;
    const formValue = this.userForm.getRawValue();
    const roleDescription = this.getRoleDescriptionById(formValue.roleId);

    const payload: Partial<IUser> & { password?: string } = {
      nickname: formValue.nickname,
      photoUrl: formValue.photoUrl,
      document: formValue.document,
      email: formValue.email,
      fullName: formValue.fullName,
      fullSurname: formValue.fullSurname,
      phone: formValue.phone,
      gender: formValue.gender,
      roles: [roleDescription]
    };

    if (!isEdit || formValue.password) {
      payload.password = formValue.password;
    }

    const request = isEdit
      ? this.userApi.updateUser(this.idUser!, payload)
      : this.userApi.createUser(payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente', 'success');
        this.getUsers();
        this.closeModal();
        this.loading = false;
      },
      error: err => {
        console.error('Error al guardar:', err);
        const msg = err.error?.message || 'Ocurrió un error al procesar la solicitud';
        Swal.fire('Error', msg, 'error');
        this.loading = false;
      }
    });
  }

  /**
   * Elimina un usuario con confirmación
   */
  deleteUser(id: number): void {
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
        this.userApi.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario ha sido eliminado', 'success');
            this.getUsers();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          }
        });
      }
    });
  }

  /**
   * Abre el modal para crear o editar usuario
   */
  openModal(content: unknown): void {
    if (!this.idUser) {
      this.userForm.reset({
        gender: null,
        roleId: null
      });
    }
    this.modalService.open(content);
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  closeModal(): void {
    this.modalService.dismissAll();
    this.userForm.reset();
    this.idUser = null;
  }

  /**
   * Limpia el filtro de búsqueda
   */
  clear(): void {
    this.filter = '';
  }

  /**
   * Devuelve la descripción del rol según su ID
   */
  getRoleDescriptionById(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.description : '';
  }

  /**
   * Devuelve el ID del rol según su descripción
   */
  getRoleIdByDescription(description: string): number | null {
    const role = this.roles.find(r => r.description === description);
    return role ? role.roleId : null;
  }

  /**
   * Reemplaza una imagen rota con una por defecto
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

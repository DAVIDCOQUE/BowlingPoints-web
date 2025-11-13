import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';
import { UserApiService } from 'src/app/services/user-api.service';
import { CategoryApiService } from 'src/app/services/category-api.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ICategory } from 'src/app/model/category.interface';
import { finalize } from 'rxjs';
import { RoleApiService } from 'src/app/services/role-api.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  @ViewChild('modalUser') modalUserRef!: TemplateRef<unknown>;

  /** Filtro de búsqueda */
  filter = '';

  /** Listado de usuarios */
  usuarios: IUser[] = [];

  /** Listado de roles */
  roles: IRole[] = [];

  /** Listado de categorías */
  categories: ICategory[] = [];

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

  /** Fecha máxima permitida*/
  maxBirthDate: Date = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  })();

  /** Inyecciones mediante inject() */
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly userApi = inject(UserApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly authService = inject(AuthService);
  private readonly roleApiService = inject(RoleApiService);

  status = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];

  /**
   * Hook de inicialización
   */
  ngOnInit(): void {
    this.initForm();
    this.getUsers();
    this.getRoles();
    this.getCategories();
  }

  get apiUrl(): string {
    return this.authService.baseUrl;
  }

  /**
   * Inicializa el formulario reactivo
   */
  initForm(): void {
    this.userForm = this.formBuilder.group({
      document: ['', Validators.required],
      fullName: ['', Validators.required],
      fullSurname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: [''],
      gender: ['', Validators.required],
      phone: [''],
      photoUrl: [''],
      categories: [[]],
      status: [true, Validators.required],
      roles: [[], Validators.required],
      password: [''],
      confirm: [''],
    });

    this.userForm.setValidators(this.passwordsMatchValidator);
  }

  /**
   * Obtiene todos los usuarios desde la API
   */
  getUsers(): void {
    this.userApi.getUsers().subscribe({
      next: (res) => {
        this.usuarios = res;
        console.log('Usuarios cargados:', this.usuarios);
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }
  /**
   * Obtiene todos los roles desde la API
   */
  getRoles(): void {
    this.roleApiService.getAll().subscribe({
      next: (res) => {
        this.roles = res;
        console.log('roles cargados:', this.roles);
      },
      error: (err) => console.error('Error al cargar roles:', err),
    });
  }

  /**
   * Obtiene todas las categorías desde la API
   */

  getCategories(): void {
    this.categoryApiService.getActiveCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  /**
   * Devuelve usuarios filtrados por término de búsqueda
   */
  get usuariosFiltrados(): IUser[] {
    const term = this.filter.toLowerCase().trim();
    if (!term) return this.usuarios;

    return this.usuarios.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term) ||
        user.fullSurname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        String(user.phone ?? '')
          .toLowerCase()
          .includes(term) ||
        this.getStatusLabel(user.status ?? false)
          .toLowerCase()
          .includes(term) ||
        user.categories?.some((c) =>
          ((c as any).name ?? (c as any).description ?? '')
            .toLowerCase()
            .includes(term)
        ) ||
        (user.roles?.some((r) => r.name.toLowerCase().includes(term)) ?? false)
    );
  }

  /**
   * Abre el modal con datos precargados para editar un usuario
   */
  editUser(user: IUser): void {
    this.idUser = user.userId;

    this.userForm.patchValue({
      document: user.document,
      photoUrl: user.photoUrl || '',
      email: user.email,
      fullName: user.fullName,
      fullSurname: user.fullSurname,
      phone: user.phone,
      gender: user.gender,
      birthDate: this.toDateInput(user.birthDate as any),
      categories: (user.categories ?? []).map((c) => c.categoryId),
      roles: (user.roles ?? []).map((r) => r.roleId),
      status: user.status,
      password: '',
      confirm: '',
    });

    this.setPasswordValidatorsForMode(true);
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

    const statusValue: boolean =
      typeof formValue.status === 'string'
        ? formValue.status === 'true'
        : !!formValue.status;

    const payload: Partial<IUser> & { password?: string } = {
      photoUrl: formValue.photoUrl,
      document: formValue.document,
      email: formValue.email,
      fullName: formValue.fullName,
      fullSurname: formValue.fullSurname,
      phone: formValue.phone,
      gender: formValue.gender,
      birthDate: formValue.birthDate || null,
      status: statusValue,
      categories: (formValue.categories ?? []).map((id: number) => ({
        categoryId: id,
      })),
      roles: (formValue.roles ?? []).map((id: number) => ({ roleId: id })),
    };

    if (!isEdit || formValue.password) {
      payload.password = formValue.password;
    }

    const request = isEdit
      ? this.userApi.updateUser(this.idUser!, payload)
      : this.userApi.createUser(payload);

    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          isEdit
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado exitosamente',
          'success'
        );
        this.getUsers();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        const msg =
          err.error?.message || 'Ocurrió un error al procesar la solicitud';
        Swal.fire('Error', msg, 'error');
      },
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userApi.deleteUser(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario ha sido eliminado', 'success');
            this.getUsers();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
          },
        });
      }
    });
  }

  /**
   * Objeto base para inicializar o limpiar el formulario
   */
  private readonly EMPTY_USER = {
    document: '',
    fullName: '',
    fullSurname: '',
    email: '',
    birthDate: null,
    gender: null,
    phone: '',
    photoUrl: '',
    categories: [] as any[],
    roles: [] as any[],
    status: true,
    password: '',
    confirm: '',
  };

  /**
   * Abre el modal para crear o editar usuario.
   */
  openModal(content: unknown): void {
    // Si el usuario ya existe, solo abrimos el modal
    if (this.idUser) {
      this.modalService.open(content);
      return;
    }

    // Si es creación, limpiamos el formulario
    this.userForm.reset(this.EMPTY_USER);
    this.setPasswordValidatorsForMode(false);

    this.modalService.open(content);
  }

  /**
   * Cierra el modal y limpia el formulario.
   */
  closeModal(): void {
    this.modalService?.dismissAll();
    this.userForm.reset(this.EMPTY_USER);
    this.idUser = null;
  }

  clear(): void {
    this.filter = '';
  }

  /**
   * Configura los validadores de contraseña según el modo (edición o creación).
   */
  private setPasswordValidatorsForMode(isEdit: boolean): void {
    const passwordCtrl = this.userForm.get('password');
    const confirmCtrl = this.userForm.get('confirm');

    if (!passwordCtrl || !confirmCtrl) {
      return;
    }

    const passwordValidators = [Validators.minLength(3)];
    const confirmValidators = [];

    if (!isEdit) {
      passwordValidators.unshift(Validators.required);
      confirmValidators.push(Validators.required);
    }

    passwordCtrl.setValidators(passwordValidators);
    confirmCtrl.setValidators(confirmValidators);

    [passwordCtrl, confirmCtrl, this.userForm].forEach((ctrl) =>
      ctrl.updateValueAndValidity({ emitEvent: false })
    );
  }

  /**
   * Valida que las contraseñas coincidan.
   */
  private readonly passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl
  ) => {
    const passwordCtrl = group.get('password');
    const confirmCtrl = group.get('confirm');

    if (!passwordCtrl || !confirmCtrl) {
      return null;
    }

    const pass = passwordCtrl.value;
    const confirm = confirmCtrl.value;

    if (!pass && !confirm) {
      return null;
    }

    const mismatch = pass !== confirm;
    return mismatch ? { passwordsMismatch: true } : null;
  };

  /**
   * Validador que impide fechas futuras en birthDate
   */
  private readonly futureDateValidator: ValidatorFn = (
    control: AbstractControl
  ) => {
    const value = control.value;
    if (!value) return null;

    const selectedDate = new Date(value);
    const today = new Date();

    // Eliminar horas para comparar solo fechas
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate > today ? { futureDate: true } : null;
  };

  /**
   * Reemplaza una imagen rota con una por defecto
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  /** Devuelve la etiqueta de estado según su valor booleano */
  getStatusLabel(value: boolean): string {
    return value ? 'Activo' : 'Inactivo';
  }

  /*
   * Devuelve true si las contraseñas no coinciden y alguno de los campos ha sido tocado
   */
  get passwordMismatchVisible(): boolean {
    const touched =
      (this.userForm.get('confirm')?.touched ?? false) ||
      (this.userForm.get('password')?.touched ?? false);
    return this.userForm.hasError('passwordsMismatch') && touched;
  }

  /** Devuelve el nombre del rol según su ID */
  getRoleNameById(roleId: number): string {
    const role = this.roles.find((r) => r.roleId === roleId);
    return role ? role.name : '';
  }

  /** Devuelve los nombres de los roles del usuario */
  getRoleNames(user: IUser): string {
    return Array.isArray(user.roles)
      ? user.roles.map((r) => r.name).join(', ')
      : '';
  }

  // Convierte Date/ISO a 'yyyy-MM-dd' para input[type="date"]
  private toDateInput(value: string | Date | null | undefined): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().slice(0, 10);
  }
}

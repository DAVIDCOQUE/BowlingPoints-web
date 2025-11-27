import { Component, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { RoleApiService } from '../../services/role-api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  /** ID del usuario autenticado */
  idUser: number | null = null;

  /** Formulario del perfil */
  userForm: FormGroup = new FormGroup({});

  /** Lista de roles y géneros */
  roles: IRole[] = [];
  roleDisplay: string = '';
  genderDisplay: string = '';
  nicknameDisplay: string = '';
  documentDisplay: string = '';
  fullNameDisplay: string = '';
  fullSurnameDisplay: string = '';


  /** Control de visibilidad de contraseñas */
  showPassword = false;
  showConfirmPassword = false;

  /** Inyecciones */
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleApiService);

  @ViewChild('avatarPreview') avatarPreviewRef!: ElementRef<HTMLImageElement>;

  /** Devuelve la URL base del backend */
  get apiUrl(): string {
    return this.authService.baseUrl;
  }

  ngOnInit(): void {
    this.initForm();
    this.getRoles();
    this.loadCurrentUser();
  }

  /** Inicializa el formulario reactivo */
  initForm(): void {
    this.userForm = this.fb.group({
      nickname: ['', Validators.required],
      document: ['', Validators.required],
      photoUrl: [''],
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

  /** Carga los datos del usuario autenticado */
  loadCurrentUser(): void {
    this.authService.fetchUser().subscribe({
      next: (res: any) => {
        const user = res;
        if (!user) return console.warn('No se recibió usuario desde fetchUser');

        this.idUser = user.userId;

        this.userForm.patchValue({
          nickname: user.nickname,
          photoUrl: user.photoUrl,
          document: user.document,
          email: user.email,
          fullName: user.fullName,
          fullSurname: user.fullSurname,
          phone: user.phone,
          gender: user.gender,
          roleIds: user.roles?.map((r: any) => r.roleId) || [],
          password: '',
          confirm: ''
        });

        this.roleDisplay = user.roles?.map((r: any) => r.name).join(', ') || '';
        this.genderDisplay = user.gender || '';
        this.nicknameDisplay = user.nickname || '';
        this.documentDisplay = user.document || '';
        this.fullNameDisplay = user.fullName || '';
        this.fullSurnameDisplay = user.fullSurname || '';

        // Previsualiza avatar (foto del backend o imagen por defecto)
        const imgSrc = this.getAvatarUrl(user);
        if (this.avatarPreviewRef?.nativeElement) {
          this.avatarPreviewRef.nativeElement.src = imgSrc;
        }
      },
      error: err => console.error('Error al cargar usuario:', err)
    });
  }

  /** Retorna la URL del avatar (completa o por defecto) */
  getAvatarUrl(user: IUser): string {
    if (user?.photoUrl) {
      return user.photoUrl.startsWith('http')
        ? user.photoUrl
        : this.apiUrl + user.photoUrl;
    }
    return 'assets/img/profile.png';
  }

  /** Retorna la imagen actual o la default */
  get photoSrc(): string {
    const photoUrl = this.userForm.controls['photoUrl'].value;
    if (!photoUrl) return 'assets/img/profile.png';
    return photoUrl.startsWith('http') ? photoUrl : this.apiUrl + photoUrl;
  }

  /** Carga los roles desde el servicio */
  getRoles(): void {
    this.roleService.getAll().subscribe({
      next: res => this.roles = res,
      error: err => console.error('Error al cargar roles:', err)
    });
  }

  /** Retorna el ID de rol según su nombre */
  getRoleIdByName(name: string): number | null {
    const role = this.roles.find(r => r.name === name);
    return role ? role.roleId : null;
  }

  /** Retorna la descripción del rol según su ID */
  getRoleDescription(roleId: number): string {
    return this.roles.find(r => r.roleId === roleId)?.name || '';
  }

  /** Manejador para error de carga de imagen */
  onImgError(event: Event, fallbackUrl: string): void {
    const img = event.target as HTMLImageElement;

    // Evita bucle infinito si ya se está usando la imagen fallback
    if (!img.src.endsWith(fallbackUrl)) {
      img.src = fallbackUrl;
    } else {
      console.warn('Fallback también falló:', fallbackUrl);
      // Opcional: puedes ocultar la imagen o poner una base64 vacía
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAFklEQVR4nO3BMQEAAADCoPdPbQ43oAAAAAAAAAAAgOUDNwAAZnyqogAAAABJRU5ErkJggg==';
    }
  }

  /** Previsualiza la imagen seleccionada (sin guardar aún) */
  previewAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (this.avatarPreviewRef?.nativeElement) {
        this.avatarPreviewRef.nativeElement.src = reader.result as string;
      }
      this.userForm.patchValue({ photoUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  /** Envía los cambios del perfil */
  onSubmit(): void {
    if (!this.userForm.valid || this.idUser === null) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const roleDescription = this.getRoleDescription(formValue.roleId);

    const payload: Partial<IUser> & { password?: string } = {
      ...formValue,
      roles: [roleDescription]
    };

    delete (payload as any).confirm;
    delete (payload as any).roleId;
    if (!payload.password) delete payload.password;

    this.authService.updateUserProfile(this.idUser, payload).subscribe({
      next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Tu perfil ha sido actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { confirmButton: 'btn btn-outline-primary btn-sm' },
          buttonsStyling: false
        }).then(r => { if (r.isConfirmed) globalThis.location.reload(); });
      },
      error: err => {
        console.error('Error al actualizar usuario:', err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al actualizar el perfil.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
          customClass: { confirmButton: 'btn btn-outline-danger' },
          buttonsStyling: false
        });
      }
    });
  }

  getRolesDescription(roleIds: number[]): string {
    if (!Array.isArray(roleIds)) return '';
    return this.roles
      .filter(r => roleIds.includes(r.roleId))
      .map(r => r.name)
      .join(', ');
  }
}

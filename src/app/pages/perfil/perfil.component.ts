import { Component, ViewChild, ElementRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';

import { AuthService } from 'src/app/auth/auth.service';
import { RoleApiService } from '../../services/role-api.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  /** Listado de usuarios (no se usa mucho en perfil, pero se mantiene) */
  usuarios: IUser[] = [];

  /** Listado de roles disponibles */
  roles: IRole[] = [];

  /** Lista de géneros disponibles */
  genders: string[] = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];

  /** ID del usuario autenticado */
  idUser: number | null = null;

  /** Formulario reactivo del perfil */
  userForm: FormGroup = new FormGroup({});

  /** Estados para mostrar u ocultar contraseñas */
  showPassword = false;
  showConfirmPassword = false;

  /** Inyecciones con inject() */
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleApiService);
  private readonly modalService = inject(NgbModal);

  @ViewChild('avatarPreview') avatarPreviewRef!: ElementRef<HTMLImageElement>;

  /**
   * Hook de inicialización
   */
  ngOnInit(): void {
    this.getRoles();
    this.initForm();
    this.loadCurrentUser();
  }

  /**
   * Inicializa el formulario reactivo
   */
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

  /**
   * Carga el usuario autenticado desde el AuthService
   */
  loadCurrentUser(): void {
    this.authService.fetchUser().subscribe({
      next: user => {
        if (!user) return;

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
          roleId: this.getRoleIdByDescription(user.roleDescription),
          password: '',
          confirm: ''
        });

        // Previsualización del avatar
        const img = user.photoUrl || 'assets/img/perfil.png';
        if (this.avatarPreviewRef?.nativeElement) {
          this.avatarPreviewRef.nativeElement.src = img;
        }
      },
      error: err => {
        console.error('Error al cargar usuario:', err);
      }
    });
  }

  /**
   * Obtiene los roles disponibles desde RoleApiService
   */
  getRoles(): void {
    this.roleService.getAll().subscribe({
      next: res => this.roles = res,
      error: err => console.error('Error al cargar roles:', err)
    });
  }

  /**
   * Retorna la descripción del rol según su ID
   */
  getRoleDescription(roleId: number): string {
    return this.roles.find(r => r.roleId === roleId)?.description || '';
  }

  /**
   * Retorna el rolId dado su descripción
   */
  getRoleIdByDescription(description: string): number | null {
    const role = this.roles.find(r => r.description === description);
    return role ? role.roleId : null;
  }

  /**
   * Retorna la ruta de la imagen del usuario (o la default)
   */
  get photoSrc(): string {
    const photoUrl = this.userForm.controls['photoUrl'].value;
    return photoUrl ? photoUrl : 'assets/img/perfil.png';
  }

  /**
   * Envía el formulario para actualizar el perfil
   */
  onSubmit(): void {
    if (!this.userForm.valid || this.idUser === null) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const roleDescription = this.getRoleDescriptionById(formValue.roleId);

    const payload: Partial<IUser> & { password?: string } = {
      ...formValue,
      roles: [roleDescription]
    };

    // Eliminamos campos innecesarios
    delete (payload as any).confirm;
    delete (payload as any).roleId;
    delete (payload as any).roleDescription;

    if (!payload.password) {
      delete payload.password;
    }

    this.authService.updateUserProfile(this.idUser, payload).subscribe({
      next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Tu perfil ha sido actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          customClass: { confirmButton: 'btn btn-outline-primary btn-sm align-items-center' },
          buttonsStyling: false
        }).then(result => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
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

  /**
   * Previsualiza el avatar seleccionado
   */
  previewAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.avatarPreviewRef?.nativeElement) {
          this.avatarPreviewRef.nativeElement.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Retorna la descripción del rol dado su ID
   */
  getRoleDescriptionById(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.description : '';
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  public apiUrl = environment.apiUrl;
  usuarios: IUser[] = [];
  roles: IRole[] = [];
  genders: string[] = ['Masculino', 'Femenino', 'No binario', 'Prefiero no decirlo'];
  idUser: number | null = null;

  userForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.getRoles();
    this.initForm();
    this.loadCurrentUser();

  }

  initForm(): void {
    this.userForm = this.formBuilder.group({
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

  loadCurrentUser(): void {
    this.http.get<{ success: boolean; data: IUser }>(`${environment.apiUrl}/users/me`)
      .subscribe({
        next: res => {
          const user = res.data;

          console.log('Usuario cargado:', user);
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

          const img = user.photoUrl || 'assets/img/perfil.png';
          this.renderer.setAttribute(
            document.getElementById('avatarPreview')!,
            'src',
            img
          );

        },
        error: err => {
          console.error('Error al cargar usuario:', err);
        }
      });
  }

  getRoles(): void {
    this.http.get<{ success: boolean; message: string; data: IRole[] }>(`${environment.apiUrl}/roles`)
      .subscribe({
        next: res => {
          this.roles = res.data;
          console.log('Roles cargados:', this.roles);
        },
        error: err => {
          console.error('Error al cargar roles:', err);
        }
      });
  }

  getRoleDescription(roleId: number): string {
    return this.roles.find(r => r.roleId === roleId)?.description || '';
  }

  get photoSrc(): string {
    const photoUrl = this.userForm.controls['photoUrl'].value;
    return photoUrl ? (this.apiUrl + photoUrl) : 'assets/img/perfil.png';
  }

  onSubmit(): void {
    if (!this.userForm.valid || this.idUser === null) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.getRawValue();
    const roleDescription = this.getRoleDescriptionById(formValue.roleId);

    const payload = {
      ...formValue,
      roles: [roleDescription]
    };
    delete payload.confirm;
    delete payload.roleId;
    delete payload.roleDescription;

    if (!payload.password) {
      delete payload.password;
    }

    this.http.put(`${environment.apiUrl}/users/${this.idUser}`, payload)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Tu perfil ha sido actualizado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            customClass: {
              confirmButton: 'btn btn-outline-primary btn-sm  align-items-center'
            },
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
            customClass: {
              confirmButton: 'btn btn-outline-danger'
            },
            buttonsStyling: false
          });
        }
      });
  }

  previewAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.getElementById('avatarPreview') as HTMLImageElement;
        if (img) img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getRoleDescriptionById(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.description : '';
  }

  getRoleIdByDescription(description: string): number | null {
    const role = this.roles.find(r => r.description === description);
    return role ? role.roleId : null;
  }
}

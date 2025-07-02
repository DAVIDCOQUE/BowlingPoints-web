import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  @ViewChild('modalUser') modalUserRef: any;

  public apiUrl = environment.apiUrl;

  filter: string = '';
  usuarios: IUser[] = [];
  roles: IRole[] = [];

  genders: string[] = ['Masculino', 'Femenino'];

  idUser: number | null = null;

  userForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getUsers();
    this.getRoles();
  }

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

  getUsers(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${environment.apiUrl}/users`)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
        },
        error: err => {
          console.error('Error al cargar usuarios:', err);
        }
      });
  }

  getRoles(): void {
    this.http.get<{ success: boolean; message: string; data: IRole[] }>(`${environment.apiUrl}/roles`)
      .subscribe({
        next: res => {
          this.roles = res.data;
        },
        error: err => {
          console.error('Error al cargar roles:', err);
        }
      });
  }

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

  saveForm(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const isEdit = !!this.idUser;
    const formValue = this.userForm.getRawValue();
    const roleDescription = this.getRoleDescriptionById(formValue.roleId);

    const payload: any = {
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
      ? this.http.put(`${environment.apiUrl}/users/${this.idUser}`, payload)
      : this.http.post(`${environment.apiUrl}/users`, payload);

    request.subscribe({
      next: () => {
        const msg = isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente';
        Swal.fire('Éxito', msg, 'success');
        this.getUsers();
        this.closeModal();
      },

      error: err => {
        console.error('Error al guardar:', err);
        const msg = err.error?.message || 'Ocurrió un error al procesar la solicitud';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

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
        this.http.delete(`${environment.apiUrl}/users/${id}`).subscribe({
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

  openModal(content: any): void {
    if (!this.idUser) {
      this.userForm.reset({
        gender: null,
        roleId: null
      });
    }
    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.userForm.reset();
    this.idUser = null;
  }

  clear(): void {
    this.filter = '';
  }

  getRoleDescriptionById(roleId: number): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.description : '';
  }

  getRoleIdByDescription(description: string): number | null {
    const role = this.roles.find(r => r.description === description);
    return role ? role.roleId : null;
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

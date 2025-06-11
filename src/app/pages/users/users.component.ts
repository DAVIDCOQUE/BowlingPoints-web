import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
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
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filter: string = '';
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
      document: ['', Validators.required],
      firstname: ['', Validators.required],
      secondname: [''],
      email: ['', [Validators.required, Validators.email]],
      lastname: ['', Validators.required],
      secondlastname: [''],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      roleId: ['', Validators.required],
      password: [''],
      confirm: ['']
    });
  }

  getUsers(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${environment.apiUrl}/users/all`)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
          console.log('Usuarios cargados:', this.usuarios);
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
          console.log('Roles cargados:', this.roles);
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
      user.firstname.toLowerCase().includes(term) ||
      (user.secondname && user.secondname.toLowerCase().includes(term)) ||
      user.lastname.toLowerCase().includes(term) ||
      (user.secondlastname && user.secondlastname.toLowerCase().includes(term)) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.roleDescription.toLowerCase().includes(term) ||
      user.gender.toLowerCase().includes(term)
    );
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

  editUser(user: IUser): void {
    this.idUser = user.userId;

    this.userForm.patchValue({
      nickname: user.nickname,
      document: user.document,
      email: user.email,
      firstname: user.firstname,
      secondname: user.secondname || '',
      lastname: user.lastname,
      secondlastname: user.secondlastname || '',
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
    console.log('Form Value:', formValue);
    const roleDescription = this.getRoleDescriptionById(formValue.roleId);
    const payload = {
      ...formValue,
      roles: [roleDescription]
    };
    delete payload.confirm;
    delete payload.roleId;
    delete payload.roleDescription;

    // LOGS para depurar
    console.log('Form Value:', formValue);
    console.log('Rol Seleccionado (roleId):', formValue.roleId);
    console.log('Rol convertido a Description:', roleDescription);
    console.log('Payload Final:', payload);

    if (isEdit && !payload.password) {
      delete payload.password;
    }

    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/users/${this.idUser}`, payload)
      : this.http.post(`${environment.apiUrl}/users/create`, payload);

    request.subscribe({
      next: () => {
        const msg = isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente';
        Swal.fire('Éxito', msg, 'success');
        this.getUsers();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: err => {
        console.error('Error al guardar:', err);
        const msg = err.error?.message || 'Ocurrió un error al procesar la solicitud';
        Swal.fire('Error', msg, 'error');
        this.isLoading$.next(false);
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
        this.http.delete(`${environment.apiUrl}/users/persona-delete/${id}`).subscribe({
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

  closeModal(): void {
    this.modalService.dismissAll();
    this.userForm.reset();
    this.idUser = null;
  }

  search(): void {
    // No es necesario implementar nada aquí con el getter usuariosFiltrados
    // pero puedes usarlo para dejar trazabilidad
    console.log('Búsqueda aplicada:', this.filter);
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
}

import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

interface Usuario {
  id: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  email: string;
  mobile: string;
  gender: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  @ViewChild('modalUser') modalUserRef: any;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filtrosForm!: FormGroup;
  filter: string = '';
  top_jugadores: any;
  usuarios: Usuario[] = [];

  idUser: number | null = null;
  userForm: FormGroup = new FormGroup({});


  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  hoverIcon: boolean = false;
  hoverIconConfirm: boolean = false;


  constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder, private http: HttpClient,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.initForm();
    this.getUsers();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      secondName: [''],
      lastName: ['', Validators.required],
      secondLastName: [''],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      // Solo usar para creación ↓
      username: [''],
      password: [''],
      confirm: ['']
    });
  }


  getUsers(): void {
    this.http.get<{ success: boolean, message: string, data: Usuario[] }>(`${environment.apiUrl}/users/v1/all`)
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

  editUser(user: Usuario): void {
    this.idUser = user.id;
    this.userForm.patchValue(user);

    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.disable();
    this.userForm.get('confirm')?.disable();

    this.openModal(this.modalUserRef);
  }

  saveForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const isEdit = !!this.idUser;

    const payload = { ...this.userForm.getRawValue() };
    delete payload.confirm;

    if (isEdit) {
      delete payload.username;
      delete payload.password;
    }

    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/users/v1/persona-update/${this.idUser}`, payload)
      : this.http.post(`${environment.apiUrl}/auth/register`, payload);

    request.subscribe({
      next: () => {
        const msg = isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente';
        Swal.fire(' Éxito', msg, 'success');
        this.getUsers();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: (err) => {
        console.error(' Error al guardar:', err);
        const msg = err.error?.message || 'Ocurrió un error al procesar la solicitud';
        Swal.fire('❌ Error', msg, 'error');
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
        this.http.delete(`${environment.apiUrl}/users/v1/persona-delete/${id}`).subscribe({
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

  search() {

  }



  openModal(content: any) {
    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll()
    this.userForm.reset();
    this.idUser = null;
  }

  clear() {

  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  private dataPath = 'assets/data';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  filtrosForm!: FormGroup;
  filter: string = '';
  top_jugadores: any;
  usuarios: any;

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
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    });
  }
  getUsers(): void {
  this.http.get(`${environment.apiUrl}/users/v1/all`).subscribe({
    next: usuarios => {
      this.usuarios = usuarios;
      console.log('Usuarios cargados:', usuarios);
    },
    error: err => {
      console.error('❌ Error al cargar usuarios:', err);
    }
  });
}

  editUser(user: any): void {
    this.idUser = user.id;
    this.userForm.patchValue(user);
    this.openModal(document.getElementById('editUserModal'));
  }

  saveForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.userForm.value };
    delete payload.confirm;

    this.isLoading$.next(true);

    const req = this.idUser
      ? this.http.put(`${environment.apiUrl}/usuarios/${this.idUser}`, payload)
      : this.http.post(`${environment.apiUrl}/auth/register`, payload);

    req.subscribe({
      next: (res) => {
        console.log('Usuario guardado', res);
        this.getUsers();
        this.isLoading$.next(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
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
        this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe({
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

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';

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
    this.get_top_jugadores();
    this.get_usuarios();
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
  get_usuarios(): void {
    this.http.get(`${this.dataPath}/club.json`).subscribe(usuarios => {
      this.usuarios = usuarios;
      console.log('📄 Usuarios cargados:', this.usuarios);
    });
  }

  get_top_jugadores(): void {
    this.http.get(`${this.dataPath}/top_jugadores.json`).subscribe(jugadores => {
      this.top_jugadores = jugadores;
      console.log('🎳 Top jugadores:', this.top_jugadores);
    });
  }

  clear() {

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

  saveForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.userForm.value };
    delete payload.confirm;

    this.isLoading$.next(true);

    this.http.post(`${environment.apiUrl}/auth/register`, payload).subscribe({
      next: (response) => {
        console.log('✅ Usuario registrado', response);
        this.isLoading$.next(false);
        this.closeModal();
      },
      error: (error) => {
        console.error('❌ Error al registrar usuario:', error);
        this.isLoading$.next(false);
      }
    });
  }
}

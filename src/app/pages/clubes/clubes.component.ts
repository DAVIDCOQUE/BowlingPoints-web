import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { ResultadosService } from 'src/app/services/resultados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.component.html',
  styleUrls: ['./clubes.component.css']
})

export class ClubesComponent implements OnInit {

  filtrosForm!: FormGroup;
  filter: string = '';
  clubes: any;

  id_Club: number | null = null;
  userForm: FormGroup = new FormGroup({});


  constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder,
    private modalService: NgbModal, public auth: AuthService
  ) { }

  ngOnInit(): void {

    this.get_clubes()
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


  get_clubes() {
    this.ResultadosService.get_clubes().subscribe(clubes => {
      this.clubes = clubes;
      console.log(this.clubes);
    }
    )
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

  }

  saveForm() {
  }

  deleteClub(id_Club: number): void {
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
        // Si estás usando backend:
        // this.http.delete(`${environment.apiUrl}/usuarios/${id}`).subscribe(...)

        // Si es local:


        Swal.fire('Eliminado', 'El usuario ha sido eliminado', 'success');
      }
    });
  }

}

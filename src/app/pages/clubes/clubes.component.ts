import { Component, OnInit, TemplateRef  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef  } from '@ng-bootstrap/ng-bootstrap';
import { ResultadosService } from 'src/app/services/resultados.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Club }              from 'src/app/interface/club';     
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Component({
  selector: 'app-clubes',
  templateUrl: './clubes.component.html',
  styleUrls: ['./clubes.component.css']
})

export class ClubesComponent implements OnInit {

  clubForm!: FormGroup;
  clubes: Club[] = [];
  id_Club?: number; 
  modalRef?: NgbModalRef;
  filter: string = '';

   constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder, private http: HttpClient,
       private modalService: NgbModal, private fb: FormBuilder, public  auth: AuthService ) { }

ngOnInit(): void {
    this.buildForm();
    this.get_clubes();
  }

  private buildForm(): void {
    this.clubForm = this.fb.group({
      clubName:     ['', Validators.required],
      creationDate: ['', Validators.required],
      members:      ['', [Validators.required, Validators.min(1)]]
    });
  }


  get_clubes(): void {
  this.ResultadosService.get_clubes()
    .subscribe((clubs) => this.clubes = clubs as Club[]);
}
 
  openModal(content: TemplateRef<any>, club?: Club): void {   // ← firma con 2 args
  if (club) {
    this.id_Club = club.id;
    this.clubForm.patchValue(club);
  } else {
    this.id_Club = undefined;
    this.clubForm.reset();
  }
  this.modalRef = this.modalService.open(content, { centered: true });
}


  closeModal(): void {
    this.modalService.dismissAll()

  }

 save() {
    if (this.clubForm.invalid) { return; }
    const payload = this.clubForm.value;

    if (this.id_Club) {
      // servicio PUT/UPDATE
    } else {
      // servicio POST/CREATE
    }
    this.closeModal();
  }

   search(): void {                           
    const term = this.filter.toLowerCase().trim();
    // Si no quieres llamar al backend, filtra localmente:
    // this.clubesFiltrados = this.clubes.filter(c => c.name.toLowerCase().includes(term));
    console.log('Buscar:', term);
  }

  clear(): void {                           
    this.filter = '';
    this.search();
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

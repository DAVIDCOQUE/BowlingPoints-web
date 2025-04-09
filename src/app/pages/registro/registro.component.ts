import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ResultadosService } from 'src/app/services/resultados.service';
import { Usuario, Person } from 'src/app/interface/usuario.interface';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {
  usuarioForm: FormGroup;
  personForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private resultadosService: ResultadosService
  ) {
    this.usuarioForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['invitado', Validators.required],
    });

    {
      this.personForm = this.fb.group({
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        correoElectronico: [''],
        telefono: ['', [Validators.required, Validators.minLength(6)]],
        id_usuario: ['invitado', Validators.required],
      });
    }
  }

  ngOnInit(): void {}

  submitUser() {
    console.log(this.usuarioForm.value);
    if (this.usuarioForm.valid) {
      const usuario: Usuario = this.usuarioForm.value;
      this.resultadosService.post_Usuarios(usuario).subscribe(
        (res) => {
          console.log('Usuario Creado', res);
          this.router.navigate(['']); // Navega a la página de inicio de sesión
        },
        (error) => {
          this.errorMessage = 'Error al crear el Usuario: ' + error.message;
          console.log(this.errorMessage);
        }
      );
    }
  }

  submitPerson() {
    console.log(this.personForm.value);
    if (this.personForm.valid) {
      const persona: Person = this.personForm.value;
      this.resultadosService.post_Persona(persona).subscribe(
        (res) => {
          console.log('Persona Creada', res);
          this.router.navigate(['']); // Navega a la página de inicio de sesión
        },
        (error) => {
          this.errorMessage = 'Error al crear la persona: ' + error.message;
          console.log(this.errorMessage);
        }
      );
    }
  }

  login() {
    this.router.navigate(['']);
  }
}

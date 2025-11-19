import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecoverPasswordService } from 'src/app/services/recover-password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css'],
})
export class RecoverPasswordComponent {
  form: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private recoverPasswordService: RecoverPasswordService
  ) {
    this.form = this.fb.group({
      identifier: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+|\d{6,20})$/
          ),
        ],
      ],
    });
  }

  get identifier() {
    return this.form.get('identifier');
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) return;

    this.loading = true;

    const identifierValue = this.form.value.identifier;

    this.recoverPasswordService.recoverPassword(identifierValue).subscribe({
      next: (res) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Revisa tu correo',
          text:
            res?.message ||
            'Si el usuario existe, se ha enviado un enlace de recuperación.',
          confirmButtonText: 'Aceptar',
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error inesperado en recuperación:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Ocurrió un error al enviar el correo. Intenta más tarde.',
        });
      },
    });
  }
}

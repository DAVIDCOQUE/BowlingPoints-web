import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecoverPasswordService } from 'src/app/services/recover-password.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  submitted = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private recoverPasswordService: RecoverPasswordService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Token inválido o faltante.';
    }

    // Validación en tiempo real
    this.form.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  // Valida que las contraseñas coincidan
  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword');
    const confirm = group.get('confirmPassword');

    if (!password || !confirm) return null;

    return password.value === confirm.value ? null : { mismatch: true };
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid || !this.token) return;

    this.loading = true;

    this.recoverPasswordService
      .resetPassword(this.token, this.form.value.newPassword)
      .subscribe({
        next: (res) => {
          console.log('✅ Backend response:', res);

          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: res.message || 'Has restablecido tu contraseña correctamente.',
            timer: 3000,
            showConfirmButton: false
          });

          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          console.error('❌ Error del backend:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Token inválido o expirado. Solicita uno nuevo.'
          });

          this.loading = false;
        }
      });
  }

}

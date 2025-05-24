import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  error: string | null = null;

  constructor(private router: Router, private http: HttpClient) { }

  submit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      console.log(' Enviando credenciales:', { userName: username, password });

      this.http.post<{ token: string }>(
        `${environment.apiUrl}/auth/login`,
        { userName: username, password }
      ).subscribe({
        next: res => {
          console.log('Token recibido:', res.token);
          localStorage.setItem('jwt_token', res.token);
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error(' Error en login:', err);
          this.error = 'Usuario o contraseña incorrectos';
        }
      });

    } else {
      console.warn('Formulario inválido');
      this.form.markAllAsTouched();
    }
  }

  loginAsGuest(): void {
    localStorage.removeItem('jwt_token');
    localStorage.setItem('roles', JSON.stringify([]));
    this.router.navigate(['/dashboard']);
  }

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }
}

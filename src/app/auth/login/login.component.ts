import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    password: new FormControl('', [Validators.required])
  });

  error: string | null = null;
  showPassword = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  submit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;

      this.http.post<{ token: string }>(
        `${environment.apiUrl}/auth/login`,
        { userName: username, password }
      ).subscribe({
        next: res => {
          // Llama a /users/me con el token obtenido
          this.http.get<{ data: any }>(`${environment.apiUrl}/users/me`, {
            headers: { 'Authorization': `Bearer ${res.token}` }
          }).subscribe({
            next: meRes => {
              // Usa el AuthService para guardar usuario y token
              this.auth.setAuthData(res.token);
              this.router.navigate(['/dashboard']);
            },
            error: err => {
              this.auth.logout();
              this.error = 'No se pudo obtener la información del usuario';
            }
          });
        },
        error: err => {
          this.error = 'Usuario o contraseña incorrectos';
        }
      });

    } else {
      this.form.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginAsGuest(): void {
    this.auth.logout();
    // Si quieres, puedes poner roles de invitado, depende de tu lógica
    this.router.navigate(['/dashboard']);
  }

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }
}

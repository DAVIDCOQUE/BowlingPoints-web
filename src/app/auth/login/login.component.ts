import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

      this.auth.login(username, password).subscribe({
        next: (token) => {
          this.auth.setAuthData(token);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
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
    this.router.navigate(['/dashboard']);
  }

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }
}

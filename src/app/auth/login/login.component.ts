import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  allowedUsers = [
    { username: 'david03sc@gmail.com', password: 'admin', roles: ['ADMIN'] },
    { username: 'jhon.soto@gmail.com', password: 'admin', roles: ['ENTRENADOR'] },
    { username: 'sara.arteaga@gmail.com', password: 'admin', roles: ['JUGADOR'] }
  ];

  error: string | null = null;

  constructor(private router: Router) { }

  submit(): void {
    if (this.form.valid) {
      const { username, password } = this.form.value;
      const userFound = this.allowedUsers.find(
        u => u.username === username && u.password === password
      );

      if (userFound) {
        localStorage.setItem('username', userFound.username);
        localStorage.setItem('roles', JSON.stringify(userFound.roles));
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Usuario o contraseña incorrectos';
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }
}

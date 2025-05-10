import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  allowedUsers = [
    { username: 'david03sc@gmail.com', password: 'admin' },
    { username: 'jhon.soto@gmail.com', password: 'admin' },
    { username: 'sara.arteaga@gmail.com', password: 'admin' }
  ];

  @Input() error: string | null | undefined;
  @Output() submitEM = new EventEmitter();

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private router: Router) { }

  ngOnInit(): void { }

  submit(): void {
    if (this.form.valid) {
      const enteredUsername = this.form.value.username;
      const enteredPassword = this.form.value.password;

      const userFound = this.allowedUsers.find(
        user => user.username === enteredUsername && user.password === enteredPassword
      );

      if (userFound) {
        // Si el usuario está autorizado, navega al body
        this.router.navigate(['body']);
      } else {
        // Si no, muestra un error
        this.error = 'Usuario o contraseña incorrectos';
      }
    } else {
      this.form.markAllAsTouched();
    }

  }


  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }
}

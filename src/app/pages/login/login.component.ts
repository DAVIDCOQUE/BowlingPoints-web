import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Input() error: string | null | undefined;
  @Output() submitEM = new EventEmitter();

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private router: Router) {}

  ngOnInit(): void {}

  submit(): void {
    if (this.form.valid) {
      this.submitEM.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  body(): void {
    this.router.navigate(['body']);
    if (this.form.valid) {
    }
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }
}

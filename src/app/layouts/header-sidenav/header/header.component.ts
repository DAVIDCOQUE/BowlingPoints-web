import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  isGuest = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    this.isGuest = roles.length === 0;
  }

  toggleSidebar() {
    this.menuToggle.emit();
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Sesión cerrada.');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        localStorage.removeItem('isGuest');
        this.router.navigate(['/login']);
      }
    });
  }
}

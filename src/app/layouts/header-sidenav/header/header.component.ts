import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { IRole } from 'src/app/model/role.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  isGuest = false;
  userEmail: string | null = null;
  userDocument: string | null = null;
  userRole!: IRole | string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.isGuest = this.authService.isGuest();
    const decoded = this.authService.decodeToken();
    console.log('Decoded Token:', decoded);
    this.userEmail = decoded?.email || null;
    this.userDocument = decoded?.sub || null;
    this.userRole = decoded?.roles?.[0] || 'INVITADO';
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
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}

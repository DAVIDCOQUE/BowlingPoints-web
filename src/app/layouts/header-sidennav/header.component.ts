import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;

  page: string = 'Dashboard';

  navItems = [
    { page: 'Dashboard', icon: 'assets/img/trofeo.png', label: 'Dashboard' },
    { page: 'Torneos', icon: 'assets/img/trofeo.png', label: 'Torneos' },
    { page: 'Cartelera', icon: 'assets/img/megafono.png', label: 'Cartelera' },
    { page: 'Jugadores', icon: 'assets/img/jugador.png', label: 'Jugadores' },
    { page: 'clubes', icon: 'assets/img/club.png', label: 'Clubes' },
  ];


  constructor(private router: Router) { }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  login() {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cerrará tu sesión.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Sesión cerrada",
          text: "¡Has salido exitosamente!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['']);
        }, 1600);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.reload();
      }
    });
  }
}

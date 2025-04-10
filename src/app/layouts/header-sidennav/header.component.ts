import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

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

  page: string = 'Torneos';

  navItems = [
    { page: 'Torneos', icon: 'assets/img/trofeo.png', label: 'Dashboard' },
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
    this.router.navigate(['']);
  }
}

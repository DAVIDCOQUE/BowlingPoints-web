import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isExpanded = true;
  isShowing = false;
  showSubmenu = false;


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

  toggleSubmenu() {
    this.showSubmenu = !this.showSubmenu;
  }

  logout() {
    // lógica real con auth service
    console.log('Cerrar sesión...');
    this.router.navigate(['/login']);
  }
}

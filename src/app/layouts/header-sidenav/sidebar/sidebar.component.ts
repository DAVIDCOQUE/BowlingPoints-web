import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isExpanded = true;
  isShowing = false;
  showSubmenu = false;

  constructor(private router: Router, public auth: AuthService) { }

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
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

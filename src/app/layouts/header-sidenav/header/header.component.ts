import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  @Output() menuToggle = new EventEmitter<void>();

  constructor(private router: Router) { }
  toggleSidebar() {
    this.menuToggle.emit();
  }

  logout() {
    // Aquí iría la lógica real de logout
    console.log('Cerrar sesión...');
    this.router.navigate(['/login']);
  }
}

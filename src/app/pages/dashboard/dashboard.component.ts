import { Component } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  topJugadores = [
    { nombre: 'Juan Pérez', puntaje: 248, avatar: 'assets/img/avatar.png' },
    { nombre: 'María Gómez', puntaje: 236, avatar: 'assets/img/avatar.png' },
    { nombre: 'Luis Rojas', puntaje: 230, avatar: 'assets/img/avatar.png' },
    { nombre: 'Juan Pérez', puntaje: 248, avatar: 'assets/img/avatar.png' },
    { nombre: 'María Gómez', puntaje: 236, avatar: 'assets/img/avatar.png' },

    // ... hasta 10
  ];
  topClubes = [
    { nombre: 'liga cali', puntaje: 248, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga palmira', puntaje: 236, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga jumbo', puntaje: 230, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga jamundi', puntaje: 248, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga armenia', puntaje: 236, avatar: 'assets/img/club-logo.png' },

    // ... hasta 10
  ];

}

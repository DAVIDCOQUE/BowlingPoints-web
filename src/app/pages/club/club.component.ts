import { Component } from '@angular/core';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent {
  club = {
    nombre: 'Club Elite Bowling Cali',
    logo: 'assets/img/club-logo.png',
    descripcion: 'Formando atletas de alto rendimiento en el bowling nacional.',
    fundacion: '2010',
    ubicacion: 'Cali, Valle del Cauca',
    ranking: 3,
    puntaje: 2475,

    logros: [
      'Campeón Nacional 2021',
      'Subcampeón Liga Suramericana 2022',
      '3er lugar Juegos Interligas 2020',
    ],

    torneos: [
      { nombre: 'Torneo Nacional Sub 21', fecha: '2023-05-12', posicion: '1º', puntaje: 750 },
      { nombre: 'Liga de Verano', fecha: '2022-08-22', posicion: '3º', puntaje: 620 },
    ],

    miembros: [
      { nombre: 'Carlos Ríos', rol: 'Capitán', foto: 'assets/img/avatar.png' },
      { nombre: 'Lucía Gómez', rol: 'Jugadora', foto: 'assets/img/avatar.png' },
      { nombre: 'Andrés Mena', rol: 'Entrenador', foto: 'assets/img/avatar.png' },
    ]
  };


  verInformacionClub() {
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-mis-torneos',
  templateUrl: './mis-torneos.component.html',
  styleUrls: ['./mis-torneos.component.css']
})
export class MisTorneosComponent {

  torneos: any = [
    {
      id: 1,
      nombre: 'Copa de la Bowling',
      foto: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/T1_logo.svg/800px-T1_logo.svg.png',
      fecha: '20 marzo 2025',
      lugar: 'Bolera XYZ, Cali, Valle',
      modalidad: 'Individual / Equipos',
      categoria: 'Sub-21, Mayores, Mixto',
      resultados: '120',
    },
  ];

}

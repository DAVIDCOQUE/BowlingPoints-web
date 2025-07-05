import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-datalles-jugador',
  templateUrl: './datalles-jugador.component.html',
  styleUrls: ['./datalles-jugador.component.css']
})
export class DatallesJugadorComponent {

  jugador: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resultadosService: ResultadosService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.resultadosService
      .get_top_jugadores()
      .subscribe((top_jugadores: any) => {
        console.log('Datos de top_jugadores:', top_jugadores);
        const jugadoresArray = top_jugadores.jugadores_colombia;
        this.jugador = jugadoresArray.find(
          (jugador: any) => jugador.id === Number(id)
        );
      });
  }

  goBack(): void {
    this.location.back();
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-jugador',
  templateUrl: './jugador.component.html',
  styleUrls: ['./jugador.component.css'],
})
export class JugadorComponent implements OnInit {
  jugador: any; // Aquí almacenaremos los datos del jugador

  constructor(
    private router: Router,
    private route: ActivatedRoute, // Para acceder al parámetro 'id' de la URL
    private resultadosService: ResultadosService 
  ) {}

  ngOnInit(): void {
    // Obtenemos el 'id' del jugador de la URL, si no existe, usamos '1' por defecto
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.resultadosService
      .get_top_jugadores()
      .subscribe((top_jugadores: any) => {
        // Imprimimos top_jugadores en la consola para verificar su estructura
        console.log('Datos de top_jugadores:', top_jugadores);
        // Asegúrate de que 'top_jugadores' tiene una lista de jugadores
        const jugadoresArray = top_jugadores.jugadores_colombia; // Accedemos al array de jugadores
        // Filtramos el jugador cuyo 'id' coincida con el proporcionado
        this.jugador = jugadoresArray.find(
          (jugador: any) => jugador.id === Number(id)
        );
      });
  }
  goBack(): void {
    this.router.navigate(['dashboard']); // Cambia 'dashboard' por la ruta deseada
  }
}

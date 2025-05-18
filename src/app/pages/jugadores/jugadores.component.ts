import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';


@Component({
  selector: 'app-jugadores',
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css']
})
export class JugadoresComponent {

  top_jugadores: any;
  usuarios: any;
  filter: string = '';

  constructor(private ResultadosService: ResultadosService, private router: Router) { }

  ngOnInit(): void {
    this.get_top_jugadores();
  }

  get_top_jugadores() {
    this.ResultadosService.get_top_jugadores().subscribe(top_jugadores => {
      this.top_jugadores = top_jugadores;
      console.log(this.top_jugadores);
    }
    )
  }

  clear() {
    this.filter = '';
  }
}

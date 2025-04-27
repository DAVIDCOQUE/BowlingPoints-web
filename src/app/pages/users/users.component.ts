import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  filtrosForm!: FormGroup;
  filter: string = '';
  top_jugadores: any;
  usuarios: any;

  constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.get_top_jugadores();
    this.get_usuarios();
  }



  get_top_jugadores() {
    this.ResultadosService.get_top_jugadores().subscribe(top_jugadores => {
      this.top_jugadores = top_jugadores;
      console.log(this.top_jugadores);
    }
    )
  }

  get_usuarios() {
    this.ResultadosService.get_Usuarios().subscribe(usuarios => {
      this.usuarios = usuarios;
      console.log(this.usuarios);
    }
    )
  }
  clear() {

  }

  search() {

  }
}

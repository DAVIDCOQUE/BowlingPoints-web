import { Component } from '@angular/core';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  person: any;

  constructor(private ResultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.get_person();
  }

  get_person() {
    this.ResultadosService.get_Personas().subscribe((person) => {
      this.person = person;
      console.log(this.person);
    });
  }
}

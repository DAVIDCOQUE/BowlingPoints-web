import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';


@Component({
  selector: 'app-datalles-torneo',
  templateUrl: './datalles-torneo.component.html',
  styleUrls: ['./datalles-torneo.component.css']
})
export class DatallesTorneoComponent implements OnInit {


  result: any;
 
  constructor(private ResultadosService: ResultadosService, private router: Router) {

  }

  atras() {
    this.router.navigate(['resumenToreno']);
  }
  ngOnInit(): void {
   this.get_DetalleEvento()

  }

  get_DetalleEvento() {
    this.ResultadosService.get_ResultadoIndividual().subscribe(results => {
      this.result = results;
      console.log(this.result);
    }
    )
  }
}

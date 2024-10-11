import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css']
})
export class TorneosComponent {

  result_tipoEvento: any;


  constructor(private ResultadosService: ResultadosService, private router: Router) { }

  ngOnInit(): void {
    this.consulta_TipoEvento()

  }

  ListaTorneo(eventType: string) {
    console.log(eventType)
    this.router.navigate(['listaTorneos/' + eventType]);
  }

  detalleTorneo() {
    this.router.navigate(['detalleTorneo']);
  }


  consulta_TipoEvento() {
    this.ResultadosService.get_TipoEvento().subscribe(results => {
      this.result_tipoEvento = results;
      // console.log(this.result_tipoEvento);
      console.log(this.result_tipoEvento.message);
    }
    )
  }
}

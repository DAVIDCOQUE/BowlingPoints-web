import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';

@Component({
  selector: 'app-resumen-torneo',
  templateUrl: './resumen-torneo.component.html',
  styleUrls: ['./resumen-torneo.component.css']
})
export class ResumenTorneoComponent {

  result_ResumenToreno: any;
  

  constructor(private ResultadosService: ResultadosService, private router: Router) { }

  ngOnInit(): void {
    this.get_ResumenToreno()

  }

  get_ResumenToreno() {
    this.ResultadosService.get_ResumenToreno().subscribe(results => {
      this.result_ResumenToreno = results;
      console.log(this.result_ResumenToreno);
    }
    )
  }

  goBack() {
    this.router.navigate(['dashboard']);
  }

  detalleTorneos() {
    this.router.navigate(['detalleTorneo']);

  }

}


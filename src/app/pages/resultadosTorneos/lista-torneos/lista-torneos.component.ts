import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lista-torneos',
  templateUrl: './lista-torneos.component.html',
  styleUrls: ['./lista-torneos.component.css']
})
export class ListaTorneosComponent {

  result_HistorialTorneo: any = null;  // Inicializa como null
  eventType: string = '';
  result_tipoEvento: any = null;  // Inicializa como null
  isLoading: boolean = true; // Para manejar el estado de carga
  hasError: boolean = false; // Para manejar errores en la carga
  listaTorneos: any = null; // Inicializa como null

  constructor(private ResultadosService: ResultadosService, private router: Router, private ActivatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getListTorneos(); // Carga la lista de torneos al iniciar el componente

    // Obtiene el parámetro eventType desde la URL
    // this.ActivatedRoute.params.subscribe(params => {
    //   this.eventType = params['eventType'];
    //   //this.get_HistorialTorneo(); // Carga los torneos basados en el tipo de evento
    // });

   // this.consulta_TipoEvento(); // Carga los tipos de eventos
  }


  getListTorneos() {
    this.isLoading = true;
    this.ResultadosService.get_hitorial_torneos().subscribe({
      next: (listaTorneos) => {
        this.listaTorneos = listaTorneos;
        console.log('Lista de torneos:', this.listaTorneos);
        this.isLoading = false;  // ✅ Cuando termina bien
      },
      error: (error) => {
        console.error('Error al cargar torneos', error);
        this.hasError = true;
        this.isLoading = false;  // ✅ Aunque falle
      }
    });
  }

  // Función para obtener el historial de torneos basado en el eventType
  // get_HistorialTorneo() {
  //   this.isLoading = true; // Inicia el estado de carga
  //   this.ResultadosService.get_HistorialTorneo(this.eventType).subscribe(
  //     (data) => {
  //       this.result_HistorialTorneo = data;
  //       console.log(this.result_HistorialTorneo);
  //       this.isLoading = false; // Finaliza el estado de carga
  //     },
  //     (error) => {
  //       console.error('Error al cargar el historial de torneos:', error);
  //       this.hasError = true; // Marca que ocurrió un error
  //       this.isLoading = false; // Finaliza el estado de carga
  //     }
  //   );
  // }

  // // Función para obtener los tipos de eventos
  // consulta_TipoEvento() {
  //   this.ResultadosService.get_TipoEvento().subscribe(
  //     (results) => {
  //       this.result_tipoEvento = results;
  //       console.log(this.result_tipoEvento.message);
  //     },
  //     (error) => {
  //       console.error('Error al cargar tipos de evento:', error);
  //       this.result_tipoEvento = { listTypeEvents: [] }; // Evita que sea undefined si falla
  //     }
  //   );
  // }

  // Navega a la pantalla de resumen de torneo
  resumenToreno(id: number) {
    this.router.navigate(['/resumen-torneo', id]);
  }
  // Navega de regreso al dashboard
  goBack() {
    this.router.navigate(['dashboard']);
  }
}

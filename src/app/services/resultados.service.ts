import { Injectable } from '@angular/core';
import { API_URLS } from '../apiServer'; // Importar las rutas
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Usuario, Person } from '../interface/usuario.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  url: string = 'http://bowlingpoints-api.test/api/';

  constructor(private http: HttpClient) {}

  // Crud Usuarios //
  get_Usuarios() {
    return this.http
      .get<Usuario[]>(`${this.url + API_URLS.usuarios}`)
      .pipe(catchError(this.handleError));
  }

  post_Usuarios(usuarioForm: Usuario) {
    return this.http
      .post<Usuario>(`${this.url + API_URLS.usuarios}`, usuarioForm)
      .pipe(catchError(this.handleError));
  }


   // CRUD Persona //
  get_Personas() {
    return this.http
      .get<Person[]>(`${this.url + API_URLS.personas}`)
      .pipe(catchError(this.handleError));
  }

  post_Persona(personaForm: Person) {
    return this.http
      .post<Person>(`${this.url + API_URLS.personas}`, personaForm)
      .pipe(catchError(this.handleError));
  }




  // GET Tipo evento en Torneos
  private tipoEvento: string = API_URLS.tipoEvento;

  // GET Torneos en Curso

  // Get Historial de Torneos
  private HistorialTorneo: string = API_URLS.historialTorneo;

  //Get  Resumen Torneo
  private ResumenToreno: string = API_URLS.resumenTorneo;

  // Get Resultado Individual

  private ResultadoIndividual: string = API_URLS.resultadoIndividual;

  // Get Clubes

  private Clubes: string = API_URLS.clubes;

  // Get top_jugadores

  private top_jugadores: string = API_URLS.topJugadores;

  private historial_torneo: string = API_URLS.historial_torneo;

  get_TipoEvento() {
    return this.http.get(`${this.url + this.tipoEvento}`);
  }
  get_HistorialTorneo(eventType: string) {
    return this.http.get<any>(`${this.url + this.HistorialTorneo + eventType}`);
  }

  get_ResumenToreno() {
    return this.http.get(`${ this.ResumenToreno}`);
  }

  get_ResultadoIndividual() {
    return this.http.get(`${this.ResultadoIndividual}`);
  }

  get_clubes() {
    return this.http.get(`${this.Clubes}`);
  }

  get_top_jugadores() {
    return this.http.get(`${this.top_jugadores}`);
  }

  get_hitorial_torneos() {
    return this.http.get(`${this.historial_torneo}`);
  }


   // Método para manejar errores
   private handleError(error: HttpErrorResponse) {
    // Aquí puedes manejar el error de la manera que desees
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, ` + `Mensaje: ${error.message}`;
    }
    console.error(errorMessage); // Registrar el error en la consola
    return throwError(() => new Error(errorMessage)); // Lanzar el error para que sea manejado en el componente
  }
}

import { Injectable } from '@angular/core';
import { tipoEvento, HistorialTorneo, ResumenToreno, ResultadoIndividual, clubes, top_jugadores } from '../apiServer';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class ResultadosService {

  url: string = 'http://localhost:9999/';

  // GET Tipo evento en Torneos
  private tipoEvento: string = tipoEvento.tipoEvento;

  // GET Torneos en Curso


  // Get Historial de Torneos
  private HistorialTorneo: string = HistorialTorneo.HistorialTorneo;

  //Get  Resumen Torneo
  private ResumenToreno: string = ResumenToreno.ResumenToreno;

  // Get Resultado Individual

  private ResultadoIndividual: string = ResultadoIndividual.ResultadoIndividual;

  // Get Clubes

  private Clubes: string = clubes.clubes;


  // Get top_jugadores

  private top_jugadores: string = top_jugadores.top_jugadores;



  constructor(private http: HttpClient) { }

  get_TipoEvento() {
    return this.http.get(`${this.url + this.tipoEvento}`);

  }
  get_HistorialTorneo(eventType: string) {
    return this.http.get<any>(`${this.url + this.HistorialTorneo + eventType}`);
  }


  get_ResumenToreno() {

    return this.http.get(`${this.url + this.ResumenToreno}`);
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

}

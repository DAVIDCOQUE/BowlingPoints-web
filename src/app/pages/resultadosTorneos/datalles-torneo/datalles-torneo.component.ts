import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
@Component({
  selector: 'app-datalles-torneo',
  templateUrl: './datalles-torneo.component.html',
  styleUrls: ['./datalles-torneo.component.css']
})
export class DatallesTorneoComponent implements OnInit {

  tournamentId!: number;
  modalityId!: number;

  resumenTorneo: any;
  result: any[] = [];
  players: any[] = [];
  maxJuegos: number = 0;


  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute, private location: Location) {
    this.tournamentId = +this.route.snapshot.paramMap.get('tournamentId')!;
    this.modalityId = +this.route.snapshot.paramMap.get('modalityId')!;

  }

  ngOnInit(): void {
    this.getResumenTorneo();
    this.getDetalleTorneo();
  }

    getResumenTorneo() {
    this.http.get<any>(`${environment.apiUrl}/results/tournament-summary?tournamentId=${this.tournamentId}`)
      .subscribe((res: any) => {
        this.resumenTorneo = res.data;
      });
  }

  getDetalleTorneo() {
    const tournamentId = this.tournamentId;
    const modalityId = this.modalityId;
    this.http.get<any>(
      `${environment.apiUrl}/results/table?tournamentId=${tournamentId}&modalityId=${modalityId}`
    ).subscribe((res: any) => {
      this.result = res.data;
      this.players = Array.isArray(this.result) ? this.result : [];
      console.log(this.players);
      // maxJuegos ahora busca el length de scores (no Juego)
      this.maxJuegos = this.players.reduce((max, p) =>
        Math.max(max, Array.isArray(p.scores) ? p.scores.length : 0), 0
      );
      console.log('Tabla de resultados:', this.result);
    });
  }

  getDetalleTorenoTodoEvento() {
    const tournamentId = this.tournamentId;
    this.http.get<any>(`${environment.apiUrl}/results/by-gender?tournamentId=${tournamentId}`)
      .subscribe((res: any) => {
        this.result = res.data;
        this.players = Array.isArray(this.result) ? this.result : [];
        this.maxJuegos = this.players.reduce((max, p) =>
          Math.max(max, Array.isArray(p.scores) ? p.scores.length : 0), 0
        );
        console.log('Tabla por género:', this.result);
      });
  }

 goBack(): void {
    this.location.back();
  }

}

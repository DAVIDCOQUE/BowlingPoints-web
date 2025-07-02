import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-datalles-torneo',
  templateUrl: './datalles-torneo.component.html',
  styleUrls: ['./datalles-torneo.component.css']
})
export class DatallesTorneoComponent implements OnInit {

  tournamentId!: number;
  ambitId!: number;
  modalityId!: number;

  result: any[] = [];
  players: any[] = [];
  maxJuegos: number = 0;


  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute) {
    this.tournamentId = +this.route.snapshot.paramMap.get('tournamentId')!;
    this.ambitId = +this.route.snapshot.paramMap.get('ambitId')!;
    this.modalityId = +this.route.snapshot.paramMap.get('id')!;

  }

  ngOnInit(): void {
    this.getDetalleTorneo();
  }

  getDetalleTorneo() {
    const tournamentId = this.tournamentId;
    const modalityId = this.modalityId;
    this.http.get<any>(
      `${environment.apiUrl}/results/table?tournamentId=${tournamentId}&modalityId=${modalityId}`
    ).subscribe((res: any) => {
      this.result = res.data;
      this.players = Array.isArray(this.result) ? this.result : [];
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


  goBack() {
    console.log('Go back', this.tournamentId);
    this.router.navigate(['/resumen-torneo', this.ambitId, this.tournamentId]);
  }

}

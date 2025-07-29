import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resumen-torneo',
  templateUrl: './resumen-torneo.component.html',
  styleUrls: ['./resumen-torneo.component.css']
})
export class ResumenTorneoComponent {

  resumenTorneo: any;
  tournamentId!: number;

  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    this.tournamentId = +this.route.snapshot.paramMap.get('tournamentId')!;
    this.getResumenTorneo();
  }

  getResumenTorneo() {
    this.http.get<any>(`${environment.apiUrl}/results/tournament-summary?tournamentId=${this.tournamentId}`)
      .subscribe((res: any) => {
        this.resumenTorneo = res.data;
        console.log(this.resumenTorneo);
      });
  }

    goBack(): void {
    this.location.back();
  }


}


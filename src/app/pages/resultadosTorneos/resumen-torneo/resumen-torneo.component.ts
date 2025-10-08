import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

// Interfaces
interface IResumenTorneo {
  tournamentName: string;
  organizer: string;
  startDate: string;
  endDate: string;
  categories: string[];
  modalities: string[];
}

@Component({
  selector: 'app-resumen-torneo',
  templateUrl: './resumen-torneo.component.html',
  styleUrls: ['./resumen-torneo.component.css']
})
export class ResumenTorneoComponent implements OnInit {

  public resumenTorneo: IResumenTorneo | null = null;
  public tournamentId!: number;

  // Inyecciones usando inject()
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  ngOnInit(): void {
    this.tournamentId = +this.route.snapshot.paramMap.get('tournamentId')!;
    this.getResumenTorneo();
  }

  getResumenTorneo(): void {
    const url = `${environment.apiUrl}/results/tournament-summary?tournamentId=${this.tournamentId}`;

    this.http.get<{ success: boolean; data: IResumenTorneo }>(url).subscribe({
      next: res => {
        this.resumenTorneo = res.data;
        console.log('Resumen del torneo:', this.resumenTorneo);
      },
      error: err => {
        console.error('Error al obtener el resumen del torneo:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}

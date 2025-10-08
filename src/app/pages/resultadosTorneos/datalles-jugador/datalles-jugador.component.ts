import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

interface UserStatistics {
  fullName: string;
  photoUrl: string;
  age: number;
  club: string;
  avgScore: number;
  bestGame: number;
  tournamentsWon: number;
}

@Component({
  selector: 'app-datalles-jugador',
  templateUrl: './datalles-jugador.component.html',
  styleUrls: ['./datalles-jugador.component.css']
})
export class DatallesJugadorComponent implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  public readonly apiUrl = environment.apiUrl;
  public statisticsUser: UserStatistics | null = null;
  public personId: number = 0;

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.paramMap.get('userId');
    this.personId = userIdParam ? +userIdParam : 0;

    if (this.personId > 0) {
      this.loadStatistics();
    }
  }

  /**
   * Carga las estadísticas del jugador desde la API.
   */
  loadStatistics(): void {
    const url = `${this.apiUrl}/api/user-stats/summary?userId=${this.personId}`;
    this.http.get<{ success: boolean; data: UserStatistics }>(url)
      .subscribe({
        next: res => {
          this.statisticsUser = res.data;
        },
        error: err => {
          console.error('Error al cargar estadísticas del jugador:', err);
        }
      });
  }

  /**
   * Navega a la página anterior.
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Reemplaza la imagen por una por defecto si hay error.
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

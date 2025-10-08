import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { ITournament } from 'src/app/model/tournament.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  /** URL base de la API */
  public readonly apiUrl = environment.apiUrl;

  /** Datos generales del dashboard */
  dashboard: any;

  /** Listado de torneos activos */
  tournaments: ITournament[] = [];

  /** Listado de clubes destacados */
  clubs: IClubs[] = [];

  /** Listado de jugadores destacados */
  players: IUser[] = [];

  /** Listado de ámbitos disponibles */
  ambits: IAmbit[] = [];

  /** Inyecciones */
  private readonly http = inject(HttpClient);
  public readonly auth = inject(AuthService);

  /**
   * Hook de inicialización del componente
   */
  ngOnInit(): void {
    this.getDashboard();
  }

  /**
   * Consulta la información del dashboard desde la API
   */
  getDashboard(): void {
    this.http.get<{ success: boolean; message: string; data: any }>(`${this.apiUrl}/api/dashboard`)
      .subscribe({
        next: res => {
          const data = res.data;
          this.dashboard = data;
          this.tournaments = data.activeTournaments ?? [];
          this.clubs = data.topClubs ?? [];
          this.players = data.topPlayers ?? [];
          this.ambits = data.ambits ?? [];
        },
        error: err => {
          console.error('Error al cargar datos del dashboard:', err);
          Swal.fire('Error', 'No se pudieron cargar los datos del dashboard', 'error');
        }
      });
  }

  /**
   * Maneja errores al cargar imágenes (reemplaza por una imagen por defecto)
   * @param event Evento del error
   * @param defaultPath Ruta de la imagen por defecto
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  /**
   * Retorna las modalidades de un torneo como cadena
   * @param tournament Torneo con modalidades
   */
  getModalitiesString(tournament: ITournament): string {
    return tournament?.modalities?.map(m => m.name).join(', ') || '-';
  }

  /**
   * Retorna las categorías de un torneo como cadena
   * @param tournament Torneo con categorías
   */
  getCategoriesString(tournament: ITournament): string {
    return tournament?.categories?.map(c => c.name).join(', ') || '-';
  }
}

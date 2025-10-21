import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

import { ITournament } from 'src/app/model/tournament.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { IUserResult } from 'src/app/model/userResult.inteface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  /** URL base de la API */
  public readonly apiUrl = environment.apiUrl;

  /** Listado de torneos activos */
  inProgressTournaments: ITournament[] = [];
  scheduledOrPostponedTournaments: ITournament[] = [];

  /** Listado de jugadores destacados */
  topPlayers: IUserResult[] = [];

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
          this.inProgressTournaments = data.inProgressTournaments ?? [];
          this.scheduledOrPostponedTournaments = data.scheduledOrPostponedTournaments ?? [];
          this.topPlayers = data.topPlayers ?? [];
          this.ambits = data.ambits ?? [];
          console.log('Dashboard data:', data);

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

import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IUserTournament } from 'src/app/model/UserTournament.interface';
import { UserTournamentApiService } from 'src/app/services/user-tournament-api.service';
import { AuthService } from 'src/app/auth/auth.service';
interface IUser {
  userId: number;
  [key: string]: unknown;
}
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-tournaments',
  templateUrl: './user-tournaments.component.html',
  styleUrls: ['./user-tournaments.component.css'],
})
export class UserTournamentsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly userTournamentApi = inject(UserTournamentApiService);
  private readonly authService = inject(AuthService);

  public userId: number = 0;
  public torneosActivos: IUserTournament[] = [];
  public torneosFinalizados: IUserTournament[] = [];


  public resultadosTorneo: Record<string, unknown> | null = null;
  public estadisticasGenerales: Record<string, unknown> | null = null;

  get apiUrl(): string {
    return this.authService.baseUrl;
  }

  constructor() {
    const user = this.getUserFromStorage();
    this.userId = user?.userId ?? 0;
  }

  ngOnInit(): void {
    if (this.userId > 0) {
      this.cargarTorneosJugados();
    }
  }

  /**
   * Carga los torneos jugados por el usuario actual.
   */
  cargarTorneosJugados(): void {
    this.userTournamentApi.getTorneosAgrupados(this.userId).subscribe({
      next: (torneos) => {
        this.torneosActivos = torneos.active;
        this.torneosFinalizados = torneos.finished;
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los torneos del usuario.',
          confirmButtonColor: '#dc3545',
        });
      },
    });
  }

  /**
   * Maneja el error de carga de una imagen reemplazándola por una por defecto.
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event?.target;
    if (target instanceof HTMLImageElement && defaultPath) {
      target.src = defaultPath;
    } else {
      console.warn('Error al reemplazar la imagen: elemento no válido.');
    }
  }

  /**
   * Obtiene de forma segura el usuario almacenado en localStorage.
   * Retorna null si el valor no existe, está corrupto o no cumple la estructura esperada.
   */
  private getUserFromStorage(): IUser | null {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return null;

    try {
      const parsed = JSON.parse(userRaw);

      if (parsed && typeof parsed.userId === 'number') {
        return parsed as IUser;
      } else {
        console.warn('Datos de usuario inválidos en localStorage');
        return null;
      }
    } catch (error) {
      console.warn('Error al parsear usuario de localStorage:', error);
      return null;
    }
  }

  getNombres(items: { name: string }[] | null | undefined): string {
    return items?.length ? items.map(i => i.name).join(' / ') : 'No especificada';
  }


}

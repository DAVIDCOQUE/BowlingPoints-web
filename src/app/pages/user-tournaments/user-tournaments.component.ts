import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IUserTournament } from 'src/app/model/UserTournament.interface';
import { UserTournamentApiService } from 'src/app/services/user-tournament-api.service';
import { AuthService } from 'src/app/auth/auth.service';
interface IUser {
  userId: number;
  [key: string]: unknown;
}

@Component({
  selector: 'app-user-tournaments',
  templateUrl: './user-tournaments.component.html',
  styleUrls: ['./user-tournaments.component.css']
})
export class UserTournamentsComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly userTournamentApi = inject(UserTournamentApiService);
  private readonly authService = inject(AuthService);

  public userId: number = 0;
  public torneosJugados: IUserTournament[] = [];

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
    this.userTournamentApi.getTorneosJugados(this.userId)
      .subscribe({
        next: torneos => this.torneosJugados = torneos,
        error: () => {
          // Aquí podrías mostrar un mensaje al usuario
          console.error('❌ No se pudieron cargar los torneos jugados');
        }
      });
  }

  /**
   * Carga los torneos en los que el usuario está inscrito.
   * Verifica si necesitas este método o si es redundante.
   */
  cargarTorneosInscriptos(): void {
    this.userTournamentApi.getTorneosInscriptos(this.userId)
      .subscribe({
        next: torneos => this.torneosJugados = torneos,
        error: () => {
          console.error('❌ No se pudieron cargar los torneos inscritos');
        }
      });
  }

  /**
   * Maneja el error de carga de una imagen reemplazándola por una por defecto.
   * @param event Evento del error de imagen
   * @param defaultPath Ruta a la imagen por defecto
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    if (target && defaultPath) {
      target.src = defaultPath;
    }
  }

  /**
   * Obtiene el usuario almacenado en localStorage
   */
  private getUserFromStorage(): IUser | null {
    try {
      const userRaw = localStorage.getItem('user');
      const parsed = userRaw ? JSON.parse(userRaw) as IUser : null;
      return parsed && typeof parsed.userId === 'number' ? parsed : null;
    } catch {
      return null;
    }
  }
}

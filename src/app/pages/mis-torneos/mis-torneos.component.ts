import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IUserTournament } from 'src/app/model/UserTournament.interface';

// Interfaz para representar el usuario logueado desde localStorage
interface IUser {
  userId: number;
  [key: string]: unknown;
}

// Respuesta genérica de la API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-mis-torneos',
  templateUrl: './mis-torneos.component.html',
  styleUrls: ['./mis-torneos.component.css']
})
export class MisTorneosComponent implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public readonly apiUrl = environment.apiUrl;

  public userId: number = 0;
  public torneosJugados: IUserTournament[] = [];

  public resultadosTorneo: Record<string, unknown> | null = null;
  public estadisticasGenerales: Record<string, unknown> | null = null;

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
    this.http.get<ApiResponse<IUserTournament[]>>(
      `${this.apiUrl}/user-tournaments/${this.userId}/played`
    ).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.torneosJugados = res.data;
        }
      },
      error: () => {
        // En producción: se recomienda mostrar una notificación al usuario
      }
    });
  }

  /**
   * Carga los torneos en los que el usuario está inscrito.
   * Actualmente usa el mismo endpoint, revisar si es correcto.
   */
  cargarTorneosInscriptos(): void {
    this.http.get<ApiResponse<IUserTournament[]>>(
      `${this.apiUrl}/user-tournaments/${this.userId}/played`
    ).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.torneosJugados = res.data;
        }
      },
      error: () => {
        // Manejo de error apropiado
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
   * Obtiene el usuario almacenado en localStorage y lo parsea con validación.
   * @returns Objeto de tipo IUser o null si falla
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

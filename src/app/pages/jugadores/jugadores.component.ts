import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-jugadores',
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css']
})
export class JugadoresComponent {

  public apiUrl = environment.apiUrl;

  filter: string = '';
  players: IUser[] = [];

  private readonly http = inject(HttpClient);
  public readonly auth = inject(AuthService);

  /**
   * Inicializa el componente cargando el ranking de jugadores.
   */
  ngOnInit(): void {
    this.getPlayersRanking();
  }

  /**
   * Obtiene el ranking de jugadores desde el backend.
   */
  getPlayersRanking(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(
      `${this.apiUrl}/results/all-player-ranking`
    ).subscribe({
      next: res => {
        this.players = res.data;
      },
      error: err => {
        console.error('Error al cargar jugadores:', err);
        Swal.fire('Error', 'No se pudo cargar el ranking de jugadores', 'error');
      }
    });
  }

  /**
   * Limpia el filtro de búsqueda.
   */
  clear(): void {
    this.filter = '';
  }

  /**
   * Reemplaza la imagen si falla la carga.
   * @param event Evento de error de imagen.
   * @param defaultPath Ruta de la imagen por defecto.
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { IUserResult } from 'src/app/model/userResult.inteface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
})
export class PlayersComponent {
  public apiUrl = environment.apiUrl;

  filter: string = '';
  players: IUserResult[] = [];

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  public readonly auth = inject(AuthService);

  /**
   * Inicializa el componente cargando el ranking de players.
   */
  ngOnInit(): void {
    this.getPlayersRanking();
  }

  /**
   * Obtiene el ranking de players desde el backend.
   */
  getPlayersRanking(): void {
    this.http
      .get<{ success: boolean; message: string; data: IUserResult[] }>(
        `${this.apiUrl}/results/all-player-ranking`
      )
      .subscribe({
        next: (res) => {
          this.players = res.data;
        },
        error: (err) => {
          console.error('Error al cargar players:', err);
          Swal.fire(
            'Error',
            'No se pudo cargar el ranking de jugadores',
            'error'
          );
        },
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
   */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  goBack(): void {
    this.router.navigate(['dashboard']);
  }
}

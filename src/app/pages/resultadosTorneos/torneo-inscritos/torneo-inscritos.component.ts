import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

// Interfaces
import { ITournament } from 'src/app/model/tournament.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IModality } from 'src/app/model/modality.interface';
import { IUser } from 'src/app/model/user.interface';

@Component({
  selector: 'app-torneo-inscritos',
  templateUrl: './torneo-inscritos.component.html',
  styleUrls: ['./torneo-inscritos.component.css']
})
export class TorneoInscritosComponent implements OnInit {
  readonly apiUrl = environment.apiUrl;

  selectedTournament: ITournament | null = null;
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  ramas: string[] = ['Masculina', 'Femenina', 'Mixta'];
  players: IUser[] = [];

  cards: { title: string; items: any[] }[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadTournament();
    this.loadPlayers();
  }

  /** =====================
   *  CARGA DE INFORMACIÓN
   *  ===================== */

  loadTournament(): void {
    // Puedes reemplazar el id estático por un parámetro de ruta más adelante
    this.http.get<{ success: boolean; data: ITournament }>(`${this.apiUrl}/tournaments/1`).subscribe({
      next: res => {
        this.selectedTournament = res.data;
        this.updateCards();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la información del torneo', 'error');
      }
    });
  }


  loadPlayers(): void {
    // Endpoint de ejemplo — adáptalo al real de tu API
    this.http.get<{ success: boolean; data: IUser[] }>(`${this.apiUrl}/tournaments/1/players`).subscribe({
      next: res => {
        this.players = res.data;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los jugadores inscritos', 'error');
      }
    });
  }

  /** =====================
   *  FUNCIONES AUXILIARES
   *  ===================== */

  updateCards(): void {
    this.cards = [
      { title: 'Modalidades', items: this.modalities },
      { title: 'Categorías', items: this.categories },
      { title: 'Ramas', items: this.ramas }
    ];
  }

  onImgError(event: Event, fallback: string): void {
    (event.target as HTMLImageElement).src = fallback;
  }
}

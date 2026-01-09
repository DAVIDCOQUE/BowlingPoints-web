import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

import { ITournament } from '../../model/tournament.interface';
import { IResults } from '../../model/result.interface';
import { ICategory } from '../../model/category.interface';
import { CategoryApiService } from 'src/app/services/category-api.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { ResultsService } from 'src/app/services/results.service';
import { LoadingService } from 'src/app/services/loading.service';
interface PlayerTournamentStats {
  tournamentName: string;
  average: number;
}
interface PlayerStats {
  name: string;
  tournaments: PlayerTournamentStats[];
  totalAverage: number;
}
@Component({
  selector: 'app-results-and-stats',
  templateUrl: './results-and-stats.component.html',
  styleUrls: ['./results-and-stats.component.css']
})
export class ResultsAndStatsComponent implements OnInit {

  @ViewChild('modalResult', { static: false }) modalResultRef!: TemplateRef<unknown>;

  isLoading$ = new BehaviorSubject<boolean>(false);

  selectedTournament: ITournament | null = null;
  tournaments: ITournament[] = [];
  results: IResults[] = [];
  filteredResults: IResults[] = [];

  allTournaments: string[] = [];

  categories: ICategory[] = [];
  selectedCategory = '';
  selectedBranch = '';

  selectedFile: File | null = null;

  private readonly apiUrl = environment.apiUrl;

  iaLoading = false;
  iaAnalysis: string | null = null;

  // Estadísticas agrupadas por jugador
  playerStats: PlayerStats[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly modalService: NgbModal,
    private readonly categoryApiService: CategoryApiService,
    private readonly tournamentApiService: TournamentsService,
    private readonly resultsService: ResultsService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.loadTournaments();
    this.loadCategories();
    this.loadResults();
  }

  // Interfaces internas para estadísticas
  private calculateAverage(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  private groupResultsByPlayerAndTournament(results: IResults[]): void {
    const grouped = new Map<string, Map<string, number[]>>();
    const tournamentSet = new Set<string>();

    for (const result of results) {
      const playerName = result.personName || 'Desconocido';
      const tournamentName = result.tournamentName || 'Sin torneo';

      tournamentSet.add(tournamentName);

      if (!grouped.has(playerName)) {
        grouped.set(playerName, new Map());
      }

      const tournaments = grouped.get(playerName)!;

      if (!tournaments.has(tournamentName)) {
        tournaments.set(tournamentName, []);
      }

      tournaments.get(tournamentName)!.push(result.score ?? 0);
    }

    this.allTournaments = Array.from(tournamentSet)
      .sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })
      );
    this.playerStats = Array.from(grouped.entries()).map(([playerName, tournamentsMap]) => {
      const tournaments: PlayerTournamentStats[] = [];

      for (const [tournamentName, scores] of tournamentsMap.entries()) {
        const avg = this.calculateAverage(scores);
        tournaments.push({ tournamentName, average: avg });
      }

      const allAverages = tournaments.map(t => t.average);
      const totalAverage = this.calculateAverage(allAverages);

      return {
        name: playerName,
        tournaments,
        totalAverage
      };
    });
  }

  // Carga de datos desde el backend
  loadTournaments(): void {
    this.tournamentApiService.getTournaments().subscribe({
      next: (res) => {
        this.tournaments = res.data ?? [];
        this.selectedTournament = this.tournaments.length ? this.tournaments[0] : null;
      },
      error: (err) => console.error('Error al cargar torneos:', err),
    });
  }

  loadCategories(): void {
    this.categoryApiService.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  loadResults(): void {
    this.resultsService.getResults().subscribe({
      next: (res) => {
        this.results = res.data ?? [];
        this.filteredResults = this.results;
        this.groupResultsByPlayerAndTournament(this.filteredResults);
      },
      error: (err) => console.error('Error al cargar resultados:', err),
    });
  }

  consultarIA(): void {
    if (this.iaLoading || !this.playerStats.length) return;

    this.iaLoading = true;
    this.iaAnalysis = null;
    this.loadingService.show(); // 🔥 SOLO loader global

    const params: any = {};

    if (this.selectedBranch) {
      params.branchId = this.selectedBranch === 'Masculino' ? 1 : 2;
    }

    if (this.selectedCategory) {
      params.categoryId = this.selectedCategory;
    }

    this.http.get<{ analysis: string }>(
      `${this.apiUrl}/api/ai/analizar-resultados-globales`,
      { params }
    ).subscribe({
      next: (res) => {
        this.iaAnalysis = res.analysis;
        this.iaLoading = false;
        this.loadingService.hide();
      },
      error: () => {
        this.iaLoading = false;
        this.loadingService.hide();
        Swal.fire('Error', 'No se pudo consultar la IA', 'error');
      }
    });
  }

  // Filtros

  onFilterChange(): void {
    const filtered = this.results.filter((r) =>
      (!this.selectedBranch || r.branchName?.toLowerCase() === this.selectedBranch.toLowerCase()) &&
      (!this.selectedCategory || r.categoryId?.toString() === this.selectedCategory)
    );

    this.filteredResults = filtered;
    this.groupResultsByPlayerAndTournament(filtered);
  }

  // Carga de archivo Excel
  openFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (event) => this.onFileSelected(event as Event);
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    Swal.fire({
      icon: 'info',
      title: 'Archivo seleccionado',
      text: `Archivo: ${file.name}`,
      confirmButtonText: 'Aceptar',
    });

    // Futuro: Implementar importación
    // this.importExcel(file);
  }

  // Acciones sobre resultados
  editResult(result: IResults): void {
    this.modalService.open(this.modalResultRef);
  }

  deleteResult(id: number): void {
    Swal.fire({
      title: '¿Eliminar resultado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/results/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
            this.loadResults();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el resultado', 'error');
          },
        });
      }
    });
  }



  openModal(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  getPlayerAverage(player: PlayerStats, torneo: string): number | null {
    const match = player.tournaments.find(t => t.tournamentName === torneo);
    return match ? match.average : null;
  }

  private getBranchIdFromSelectedBranch(branchName: string): number | null {
    const v = (branchName || '').toLowerCase().trim();
    if (!v) return null;

    // Ajusta IDs según tu BD:
    // ejemplo típico: Masculino=1, Femenino=2
    if (v === 'masculino') return 1;
    if (v === 'femenino') return 2;

    return null;
  }

}


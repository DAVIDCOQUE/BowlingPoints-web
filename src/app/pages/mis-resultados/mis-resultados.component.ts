import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from 'src/environments/environment';

// Interfaz básica para las estadísticas
interface IEstadisticas {
  tournamentsWon: number;
  totalTournaments: number;
  totalStrikes: number;
  avgScore: number;
  bestGame: number;
}
interface ITorneoResumen {
  tournamentId: number;
  name: string;
  startDate: string;
  lugar: string;
  modalidad: string;
  categoria: string;
  bestScore: number;
  imageUrl: string;
  resultados: number;
}

@Component({
  selector: 'app-mis-resultados',
  templateUrl: './mis-resultados.component.html',
  styleUrls: ['./mis-resultados.component.css']
})
export class MisResultadosComponent implements AfterViewInit {
  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas2', { static: false }) lineChartCanvas2!: ElementRef<HTMLCanvasElement>;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  public readonly apiUrl = environment.apiUrl;

  private lineChartInstance?: Chart;
  private barChartInstance2?: Chart;

  public imagenesEstadisticas: Record<string, string> = {
    torneo: 'assets/img/torneoDefault.png',
    chuzas: 'assets/img/chuzas.png',
    promedio: 'assets/img/promedio.png',
    mejorJuego: 'assets/img/mejor-juego.png'
  };

  public torneos: ITorneoResumen[] = [];
  public topTorneos: ITorneoResumen[] = [];
  public estadisticas: IEstadisticas = {
    tournamentsWon: 0,
    totalTournaments: 0,
    totalStrikes: 0,
    avgScore: 0,
    bestGame: 0
  };

  public userId: number = 0;

  constructor() {
    Chart.register(...registerables);
    const user = this.getUserFromStorage();
    this.userId = user?.userId ?? 0;
  }

  ngOnInit(): void {
    if (this.userId > 0) {
      this.cargarEstadisticas();
      this.cargarTopTorneos();
    }
  }

  ngAfterViewInit(): void {
    this.updateCharts();
  }

  /**
   * Obtiene las estadísticas generales del usuario.
   */
  private cargarEstadisticas(): void {
    this.http.get<{ success: boolean; data: IEstadisticas }>(
      `${this.apiUrl}/api/user-stats/summary?userId=${this.userId}`
    ).subscribe({
      next: res => {
        if (res.success) {
          this.estadisticas = res.data;
        }
      }
    });
  }

  /**
   * Carga los torneos más destacados del usuario para visualización.
   */
  private cargarTopTorneos(): void {
    this.http.get<{ success: boolean; data: ITorneoResumen[] }>(
      `${this.apiUrl}/api/user-stats/top-tournaments?userId=${this.userId}`
    ).subscribe({
      next: res => {
        if (res.success) {
          this.topTorneos = res.data;
          this.torneos = res.data; // Asumido como origen de datos de los gráficos
          this.updateCharts();
        }
      }
    });
  }

  /**
   * Inicializa los gráficos de líneas y barras si no están creados.
   */
  private updateCharts(): void {
    if (this.lineChartCanvas && !this.lineChartInstance) {
      this.createLineChart();
    }
    if (this.lineChartCanvas2 && !this.barChartInstance2) {
      this.createBarChart2();
    }
  }

  /**
   * Crea un gráfico de líneas con los resultados por torneo.
   */
  private createLineChart(): void {
    const labels = this.torneos.map(t => t.name);
    const data = this.torneos.map(t => t.resultados);

    this.lineChartInstance = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Resultados por Torneo',
          data,
          fill: true,
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderColor: '#007bff',
          tension: 0.3
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutBounce'
        }
      }
    });
  }

  /**
   * Crea un gráfico de barras con los resultados por torneo.
   */
  private createBarChart2(): void {
    const labels = this.torneos.map(t => t.name);
    const data = this.torneos.map(t => t.resultados);

    this.barChartInstance2 = new Chart(this.lineChartCanvas2.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Resultados por Torneo',
          data,
          backgroundColor: [
            'rgba(0, 123, 255, 0.5)',
            'rgba(40, 167, 69, 0.5)',
            'rgba(255, 193, 7, 0.5)',
            'rgba(220, 53, 69, 0.5)'
          ],
          borderColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#dc3545'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Navega al resumen del torneo seleccionado.
   * @param id ID del torneo
   */
  public resumenToreno(id: number): void {
    this.router.navigate(['/resumen-torneo', id]);
  }

  /**
   * Reemplaza la imagen si hay un error al cargarla.
   */
  public onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    if (target && defaultPath) {
      target.src = defaultPath;
    }
  }

  /**
   * Obtiene el usuario desde localStorage y lo parsea con validación.
   */
  private getUserFromStorage(): { userId: number } | null {
    try {
      const userRaw = localStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      return user && typeof user.userId === 'number' ? user : null;
    } catch {
      return null;
    }
  }
}

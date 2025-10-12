import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ITorneoResumen, IEstadisticas, UserStatsApiService } from 'src/app/services/user-stats-api.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css']
})
export class UserStatsComponent implements AfterViewInit {

  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas2') lineChartCanvas2!: ElementRef<HTMLCanvasElement>;

  private readonly router = inject(Router);
  private readonly userStatsApi = inject(UserStatsApiService);
  private readonly authService = inject(AuthService);

  public userId: number = 0;
  public torneos: ITorneoResumen[] = [];
  public topTorneos: ITorneoResumen[] = [];
  public estadisticas: IEstadisticas = {
    tournamentsWon: 0,
    totalTournaments: 0,
    totalStrikes: 0,
    avgScore: 0,
    bestGame: 0
  };

  public imagenesEstadisticas: Record<string, string> = {
    torneo: 'assets/img/torneoDefault.png',
    chuzas: 'assets/img/chuzas.png',
    promedio: 'assets/img/promedio.png',
    mejorJuego: 'assets/img/mejor-juego.png'
  };

  private lineChartInstance?: Chart;
  private barChartInstance2?: Chart;

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

  get apiUrl(): string {
    return this.authService.baseUrl;
  }


  ngAfterViewInit(): void {
    this.updateCharts();
  }

  /** Carga estadísticas generales del usuario */
  private cargarEstadisticas(): void {
    this.userStatsApi.getResumenEstadisticas(this.userId).subscribe({
      next: data => this.estadisticas = data,
      error: () => console.error('❌ Error al cargar estadísticas')
    });
  }

  /** Carga los torneos destacados del usuario */
  private cargarTopTorneos(): void {
    this.userStatsApi.getTopTorneos(this.userId).subscribe({
      next: torneos => {
        this.topTorneos = torneos;
        this.torneos = torneos;
        this.updateCharts();
      },
      error: () => console.error('❌ Error al cargar torneos')
    });
  }

  /** Crea gráficos si aún no están creados */
  private updateCharts(): void {
    if (this.lineChartCanvas && !this.lineChartInstance) this.createLineChart();
    if (this.lineChartCanvas2 && !this.barChartInstance2) this.createBarChart2();
  }

  /** Crea el gráfico de líneas */
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

  /** Crea el gráfico de barras */
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
          y: { beginAtZero: true }
        }
      }
    });
  }

  /** Navega al resumen de un torneo */
  resumenToreno(id: number): void {
    this.router.navigate(['/resumen-torneo', id]);
  }

  /** Reemplaza la imagen si no carga */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    if (target) target.src = defaultPath;
  }

  /** Obtiene el usuario del localStorage */
  private getUserFromStorage(): { userId: number } | null {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed.userId === 'number' ? parsed : null;
    } catch {
      return null;
    }
  }
}

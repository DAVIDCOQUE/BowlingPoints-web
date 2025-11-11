import { AfterViewInit, Component, ElementRef, ViewChild, inject, OnInit, } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { UserStatsApiService } from 'src/app/services/user-stats-api.service';
import Swal from 'sweetalert2';

import { environment } from '../../../environments/environment';

// Interfaces de la respuesta del backend
interface UserDashboardStats {
  avgScoreGeneral: number;
  bestLine: number;
  totalTournaments: number;
  totalLines: number;
  bestTournamentAvg: TournamentAvg;
  avgPerTournament: TournamentAvg[];
  avgPerModality: ModalityAvg[];
  scoreDistribution: ScoreRange[];
}

interface TournamentAvg {
  tournamentId: number;
  tournamentName: string;
  imageUrl: string;
  average: number;
  startDate: string;
}

interface ModalityAvg {
  modalityName: string;
  average: number;
}

interface ScoreRange {
  label: string;
  count: number;
}

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css'],
})
export class UserStatsComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartModalidad') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartDistribucion') scoreDistChartCanvas!: ElementRef<HTMLCanvasElement>;


  private readonly userStatsApi = inject(UserStatsApiService);

  public readonly apiUrl = environment.apiUrl;
  public userId: number = 0;
  public dashboardStats!: UserDashboardStats;

  private lineChartInstance?: Chart;
  private barChartInstance?: Chart;
  private scoreDistChartInstance?: Chart;

  constructor() {
    Chart.register(...registerables);
    this.initializeUser();
  }

  ngOnInit(): void {
    if (this.userId > 0) {
      this.loadDashboardStats();
    }
  }

  ngAfterViewInit(): void {
    this.renderAllCharts();
  }

  private initializeUser(): void {
    const user = this.getUserFromStorage();
    this.userId = user?.userId ?? 0;
  }

  /** Llama al backend y carga las estadísticas */
  private loadDashboardStats(): void {
    this.userStatsApi.getDashboardStats(this.userId).subscribe({
      next: (data) => {
        this.dashboardStats = data;
        console.log('Estadísticas dashboard cargadas:', this.dashboardStats);
        this.renderAllCharts();
      },
      error: () => this.handleError('estadísticas del dashboard'),
    });
  }

  /** Renderiza todos los gráficos */
  private renderAllCharts(): void {
    if (!this.dashboardStats) return;

    if (this.lineChartCanvas && !this.lineChartInstance) this.renderLineChart();
    if (this.barChartCanvas && !this.barChartInstance) this.renderBarChart();
    if (this.scoreDistChartCanvas && !this.scoreDistChartInstance)
      this.renderScoreDistributionChart();
  }

  /** Gráfico de línea - promedio por torneo */
  private renderLineChart(): void {
    const labels = this.dashboardStats.avgPerTournament.map(t => t.tournamentName);
    const data = this.dashboardStats.avgPerTournament.map(t => t.average);

    // Gradiente para el fondo de la línea
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 123, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 123, 255, 0)');

    this.lineChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Promedio por Torneo',
          data,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#007bff',
          borderWidth: 2,
          pointBackgroundColor: '#007bff',
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 13 }, color: '#444' }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            ticks: { color: '#555', font: { size: 12 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#555', stepSize: 20 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }
  /** Gráfico de barras - promedio por modalidad */
  private renderBarChart(): void {
    const labels = this.dashboardStats.avgPerModality.map(m => m.modalityName);
    const data = this.dashboardStats.avgPerModality.map(m => m.average);

    this.barChartInstance = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Promedio por Modalidad',
          data,
          backgroundColor: 'rgba(40, 167, 69, 0.5)',
          borderColor: '#28a745',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(40, 167, 69, 0.8)',
          maxBarThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 13 }, color: '#444' }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            ticks: { color: '#555', font: { size: 12 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#555', stepSize: 20 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  }


  /** Gráfico de barras - distribución de puntajes */
  private renderScoreDistributionChart(): void {
    const labels = this.dashboardStats.scoreDistribution.map(s => s.label);
    const data = this.dashboardStats.scoreDistribution.map(s => s.count);

    // Paleta dinámica
    const colors = [
      'rgba(255, 99, 132, 0.6)',   // rojo
      'rgba(255, 159, 64, 0.6)',   // naranja
      'rgba(255, 205, 86, 0.6)',   // amarillo
      'rgba(75, 192, 192, 0.6)',   // verde agua
      'rgba(54, 162, 235, 0.6)',   // azul
      'rgba(153, 102, 255, 0.6)'   // violeta
    ];

    this.scoreDistChartInstance = new Chart(this.scoreDistChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Distribución de Puntajes',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.6', '1')),
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: colors.slice(0, labels.length).map(c => c.replace('0.6', '0.8')),
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 13 }, color: '#444' }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            ticks: { color: '#555', font: { size: 12 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#555', stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  /** Reemplazo de imagen en caso de error */
  onImgError(event: Event, defaultPath: string): void {
    const target = event?.target;
    if (target instanceof HTMLImageElement) {
      target.src = defaultPath;
    }
  }

  /** Obtener usuario desde localStorage */
  private getUserFromStorage(): { userId: number } | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed.userId === 'number' ? parsed : null;
    } catch (error) {
      console.error(' Error al parsear usuario del almacenamiento:', error);
      return null;
    }
  }

  /** Manejo de errores */
  private handleError(context: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: ` No se pudieron cargar las ${context}.`,
      confirmButtonColor: '#dc3545',
    });
  }

  public imagenesEstadisticas: Record<string, string> = {
    torneo: 'assets/img/torneoDefault.png',
    chuzas: 'assets/img/chuzas.png',
    promedio: 'assets/img/promedio.png',
    mejorJuego: 'assets/img/mejor-juego.png',
  };
}

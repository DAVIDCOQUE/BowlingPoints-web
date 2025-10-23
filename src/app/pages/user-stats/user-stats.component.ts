import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import {
  ITorneoResumen,
  IEstadisticas,
  UserStatsApiService,
} from 'src/app/services/user-stats-api.service';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css'],
})
export class UserStatsComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas2')
  lineChartCanvas2!: ElementRef<HTMLCanvasElement>;

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
    bestGame: 0,
  };

  public imagenesEstadisticas: Record<string, string> = {
    torneo: 'assets/img/torneoDefault.png',
    chuzas: 'assets/img/chuzas.png',
    promedio: 'assets/img/promedio.png',
    mejorJuego: 'assets/img/mejor-juego.png',
  };

  private lineChartInstance?: Chart;
  private barChartInstance2?: Chart;

  constructor() {
    Chart.register(...registerables);
    this.initializeUser();
  }

  /** Inicializa datos de usuario desde el almacenamiento */
  private initializeUser(): void {
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
      next: (data) => (this.estadisticas = data),
      error: () => this.handleError('estadísticas'),
    });
  }

  /** Carga los torneos destacados del usuario */
  private cargarTopTorneos(): void {
    this.userStatsApi.getTopTorneos(this.userId).subscribe({
      next: (torneos) => {
        this.topTorneos = torneos;
        this.torneos = torneos;
        this.updateCharts();
      },
      error: () => this.handleError('torneos'),
    });
  }

  /** Crea gráficos si aún no están creados */
  private updateCharts(): void {
    const charts = [
      {
        canvas: this.lineChartCanvas,
        instance: this.lineChartInstance,
        create: () => this.createLineChart(),
      },
      {
        canvas: this.lineChartCanvas2,
        instance: this.barChartInstance2,
        create: () => this.createBarChart2(),
      },
    ];

    charts.forEach(({ canvas, instance, create }) => {
      if (canvas && !instance) create();
    });
  }

  /** Crea el gráfico de líneas */
  private createLineChart(): void {
    const labels = this.torneos.map((t) => t.name);
    const data = this.torneos.map((t) => t.resultados);
    this.lineChartInstance = this.createChartBase(
      'line',
      this.lineChartCanvas,
      labels,
      data
    );
  }

  /** Crea el gráfico de barras */
  private createBarChart2(): void {
    const labels = this.torneos.map((t) => t.name);
    const data = this.torneos.map((t) => t.resultados);
    this.barChartInstance2 = this.createChartBase(
      'bar',
      this.lineChartCanvas2,
      labels,
      data
    );
  }

  /** Crea la configuración base para cualquier gráfico */
  private createChartBase(
    type: 'line' | 'bar',
    canvas: ElementRef<HTMLCanvasElement>,
    labels: string[],
    data: number[]
  ): Chart {
    return new Chart(canvas.nativeElement, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: 'Resultados por Torneo',
            data,
            fill: type === 'line',
            backgroundColor:
              type === 'line'
                ? 'rgba(0, 123, 255, 0.1)'
                : [
                    'rgba(0, 123, 255, 0.5)',
                    'rgba(40, 167, 69, 0.5)',
                    'rgba(255, 193, 7, 0.5)',
                    'rgba(220, 53, 69, 0.5)',
                  ],
            borderColor:
              type === 'line'
                ? '#007bff'
                : ['#007bff', '#28a745', '#ffc107', '#dc3545'],
            borderWidth: 1,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
        animation: {
          duration: 1500,
          easing: 'easeOutBounce',
        },
        scales:
          type === 'bar'
            ? {
                y: { beginAtZero: true },
              }
            : undefined,
      },
    });
  }

  /** Navega al resumen de un torneo */
  resumenTorneo(id: number): void {
    this.router.navigate(['/resumen-torneo', id]);
  }

  /** Reemplaza la imagen si no carga */
  onImgError(event: Event, defaultPath: string): void {
    const target = event?.target;
    if (target instanceof HTMLImageElement) {
      target.src = defaultPath;
    } else {
      console.warn('Elemento no válido para reemplazar imagen.');
    }
  }

  /** Obtiene el usuario del localStorage */
  private getUserFromStorage(): { userId: number } | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed.userId === 'number' ? parsed : null;
    } catch (error) {
      console.error('❌ Error al parsear usuario del almacenamiento:', error);
      return null;
    }
  }

  private handleError(context: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `❌ No se pudieron cargar los ${context}.`,
      confirmButtonColor: '#dc3545',
    });
  }
}

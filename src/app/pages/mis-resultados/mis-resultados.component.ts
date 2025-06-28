import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mis-resultados',
  templateUrl: './mis-resultados.component.html',
  styleUrls: ['./mis-resultados.component.css']
})

export class MisResultadosComponent implements AfterViewInit {
  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas2', { static: false }) lineChartCanvas2!: ElementRef<HTMLCanvasElement>;

  private lineChartInstance?: Chart;
  private barChartInstance2?: Chart;

  imagenesEstadisticas: { [key: string]: string } = {
    torneo: 'assets/img/torneoDefault.png',
    chuzas: 'assets/img/chuzas.png',
    promedio: 'assets/img/promedio.png',
    mejorJuego: 'assets/img/mejor-juego.png'
  };

  public apiUrl = environment.apiUrl;

  torneos: any[] = [];
  topTorneos: any[] = [];
  estadisticas: any;

  userId: number = 0;

  constructor(private router: Router, private http: HttpClient) {
    Chart.register(...registerables);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.userId;
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarTopTorneos();
  }

  ngAfterViewInit(): void {
    this.updateCharts();
  }

  cargarEstadisticas(): void {
    this.http.get(`${environment.apiUrl}/api/user-stats/summary?userId=${this.userId}`)
      .subscribe((res: any) => {
        this.estadisticas = res.data;
        console.log('Resumen de estadísticas:', this.estadisticas);
      });
  }

  cargarTopTorneos(): void {
    this.http.get<any[]>(`${environment.apiUrl}/api/user-stats/top-tournaments?userId=${this.userId}`)
      .subscribe((res: any) => {
        this.topTorneos = res.data;
        console.log('Top torneos:', this.topTorneos);
      });
  }

  updateCharts(): void {
    // Ejemplo: graficar puntajes de torneos jugados
    if (this.lineChartCanvas && !this.lineChartInstance) {
      this.createLineChart();
    }
    if (this.lineChartCanvas2 && !this.barChartInstance2) {
      this.createBarChart2();
    }
  }

  private createLineChart(): void {
    if (this.lineChartInstance) {
      this.lineChartInstance.destroy();
    }
    // Suponiendo que torneos tiene un campo puntaje/resultados
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

  private createBarChart2(): void {
    if (this.barChartInstance2) {
      this.barChartInstance2.destroy();
    }
    // Mismo labels/datos para demo
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

  resumenToreno(id: number) {
    this.router.navigate(['/resumen-torneo', id]);
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

}

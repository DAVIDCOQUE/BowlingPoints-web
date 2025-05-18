import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-mis-resultados',
  templateUrl: './mis-resultados.component.html',
  styleUrls: ['./mis-resultados.component.css']
})
export class MisResultadosComponent implements AfterViewChecked {

  @ViewChild('lineChartCanvas', { static: false }) lineChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartCanvas2', { static: false }) lineChartCanvas2!: ElementRef<HTMLCanvasElement>;

  private lineChartInstance?: Chart;
  private barChartInstance2?: Chart;

  constructor(private router: Router) {
    Chart.register(...registerables);
  }

  torneos: any = [
    {
      id: 1,
      nombre: 'Copa de la Bowling',
      foto: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/T1_logo.svg/800px-T1_logo.svg.png',
      fecha: '20 marzo 2025',
      lugar: 'Bolera XYZ, Cali, Valle',
      modalidad: 'Individual / Equipos',
      categoria: 'Sub-21, Mayores, Mixto',
      resultados: '120',
    },
  ];

  estadisticas = [
    { titulo: 'Torneos Ganados', valor: '6/16', icono: '../../../assets/img/trofeo.png' },
    { titulo: 'Chuzas Totales', valor: '120', icono: '../../../assets/img/chuzas.png' },
    { titulo: 'Promedio por Partida', valor: '180', icono: '../../../assets/img/promedio.png' },
    { titulo: 'Mejor Juego', valor: '279', icono: '../../../assets/img/mejor-juego.png' }
  ];


  ngAfterViewChecked(): void {
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

    this.lineChartInstance = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
        datasets: [{
          label: 'Puntaje',
          data: [65, 59, 80, 81],
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

    this.barChartInstance2 = new Chart(this.lineChartCanvas2.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
        datasets: [{
          label: 'Total Acumulado',
          data: [120, 180, 260, 340],
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

}

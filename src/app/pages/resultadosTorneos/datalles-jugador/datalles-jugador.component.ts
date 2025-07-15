import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';


@Component({
  selector: 'app-datalles-jugador',
  templateUrl: './datalles-jugador.component.html',
  styleUrls: ['./datalles-jugador.component.css']
})
export class DatallesJugadorComponent {

  public apiUrl = environment.apiUrl;
  statisticsUser: any;
  personId: number = 0;

  constructor(
    private http: HttpClient, private router: Router, private route: ActivatedRoute, private location: Location
  ) {
    this.personId = +this.route.snapshot.paramMap.get('userId')!;
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.http.get(`${environment.apiUrl}/api/user-stats/summary?userId=${this.personId}`)
      .subscribe((res: any) => {
        this.statisticsUser = res.data;
        console.log('Estadísticas:', this.statisticsUser);
      });
  }

  goBack(): void {
    this.location.back();
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

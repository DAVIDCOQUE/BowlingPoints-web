import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IUserTournament } from 'src/app/model/UserTournament.interface';

@Component({
  selector: 'app-mis-torneos',
  templateUrl: './mis-torneos.component.html',
  styleUrls: ['./mis-torneos.component.css']
})
export class MisTorneosComponent {

  public apiUrl = environment.apiUrl;

  userId: number = 0;
  torneosJugados: IUserTournament[] = [];

  resultadosTorneo: any;
  estadisticasGenerales: any;

  constructor(private router: Router, private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.userId;
  }

  ngOnInit(): void {
    this.cargarTorneosJugados();
  }

  cargarTorneosJugados(): void {
    this.http.get<{ success: boolean; message: string; data: IUserTournament[] }>(
      `${environment.apiUrl}/user-tournaments/${this.userId}/played`
    )
      .subscribe(res => {
        this.torneosJugados = res.data;
      });
  }

  cargarTorneosInscriptos(): void {
    this.http.get<any>(`${environment.apiUrl}/user-tournaments/${this.userId}/played`)
      .subscribe((res: any) => {
        this.torneosJugados = res.data;
      });
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

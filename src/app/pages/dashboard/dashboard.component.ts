import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { ITournament } from 'src/app/model/tournament.interface';
import { IAmbit } from 'src/app/model/ambit.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  dashboard: any;
  public apiUrl = environment.apiUrl;

  tournaments: ITournament[] = [];
  clubs: IClubs[] = [];
  players: IUser[] = [];
  ambits: IAmbit[] = [];

  constructor(
    private http: HttpClient,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.getDashboard();
  }

  getDashboard(): void {
    this.http.get<{ success: boolean; message: string; data: any }>(`${environment.apiUrl}/api/dashboard`)
      .subscribe({
        next: res => {
          this.dashboard = res.data;

          this.tournaments = res.data.activeTournaments ?? [];
          this.clubs = res.data.topClubs ?? [];
          this.players = res.data.topPlayers ?? [];
          this.ambits = res.data.ambits ?? [];
          console.log(this.tournaments);
        },
        error: err => {
          console.error('❌ Error al cargar data:', err);
          Swal.fire('Error', 'No se pudieron cargar los data', 'error');
        }
      });
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

}

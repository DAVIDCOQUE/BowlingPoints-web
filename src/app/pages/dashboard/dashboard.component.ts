import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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


  topJugadores = [
    { nombre: 'Juan Pérez', puntaje: 248, avatar: 'assets/img/avatar.png' },
    { nombre: 'María Gómez', puntaje: 236, avatar: 'assets/img/avatar.png' },
    { nombre: 'Luis Rojas', puntaje: 230, avatar: 'assets/img/avatar.png' },
    { nombre: 'Juan Pérez', puntaje: 248, avatar: 'assets/img/avatar.png' },
    { nombre: 'María Gómez', puntaje: 236, avatar: 'assets/img/avatar.png' },

    // ... hasta 10
  ];
  topClubes = [
    { nombre: 'liga cali', puntaje: 248, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga palmira', puntaje: 236, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga jumbo', puntaje: 230, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga jamundi', puntaje: 248, avatar: 'assets/img/club-logo.png' },
    { nombre: 'liga armenia', puntaje: 236, avatar: 'assets/img/club-logo.png' },

    // ... hasta 10
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    public auth: AuthService
  ) { }


  ngOnInit(): void {
    this.getDashboard();
  }

  getDashboard(forceRefresh: boolean = false): void {
    this.http.get<{ success: boolean; message: string; data: any }>(`${environment.apiUrl}/api/dashboard`)
      .subscribe({
        next: res => {
          this.dashboard = res.data;

          // Asigna cada campo a su variable respectiva
          this.tournaments = res.data.activeTournaments ?? [];
          this.clubs = res.data.topClubs ?? [];
          this.players = res.data.topPlayers ?? [];
          this.ambits = res.data.ambits ?? [];

          console.log('✅ Data cargada correctamente:', this.dashboard);
          console.log('🏆 Torneos:', this.tournaments);
          console.log('🏅 Clubs:', this.clubs);
          console.log('🎳 Players:', this.players);
          console.log('🌎 Ambits:', this.ambits);
        },
        error: err => {
          console.error('❌ Error al cargar data:', err);
          Swal.fire('Error', 'No se pudieron cargar los data', 'error');
        }
      });
  }

}

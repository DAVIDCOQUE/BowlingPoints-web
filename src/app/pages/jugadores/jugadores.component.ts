import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'app-jugadores',
  templateUrl: './jugadores.component.html',
  styleUrls: ['./jugadores.component.css']
})
export class JugadoresComponent {

   public apiUrl = environment.apiUrl;

  filter: string = '';
  players: IUser[] = [];

  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.getDashboard();
  }

  getDashboard(): void {
    this.http.get<{ success: boolean; message: string; data: any }>(`${environment.apiUrl}/results/all-player-ranking`)
      .subscribe({
        next: res => {
          this.players = res.data;
          console.log(this.players);
        },
        error: err => {
          console.error('❌ Error al cargar data:', err);
          Swal.fire('Error', 'No se pudieron cargar los data', 'error');
        }
      });
  }

  clear() {
    this.filter = '';
  }

  onImgError(event: Event, defaultPath: string) {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

}

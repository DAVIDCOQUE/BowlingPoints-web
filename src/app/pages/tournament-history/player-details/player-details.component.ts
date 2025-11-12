import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { UserStatsApiService } from 'src/app/services/user-stats-api.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-player-details',
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.css']
})
export class PlayerDetailsComponent implements OnInit {

  private readonly userStatsApi = inject(UserStatsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  public readonly apiUrl = environment.apiUrl;
  public statisticsUser: any | null = null;
  public personId: number = 0;

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.paramMap.get('userId');
    this.personId = userIdParam ? +userIdParam : 0;

    if (this.personId > 0) {
      this.loadStatistics();
    }
  }

  loadStatistics(): void {
    this.userStatsApi.getPlayerStats(this.personId).subscribe({
      next: (data) => {
        this.statisticsUser = data;
        console.log('Estadísticas del jugador cargadas:', this.statisticsUser);
      },
      error: () => this.handleError('estadísticas del jugador'),
    });
  }

  private handleError(context: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: ` No se pudieron cargar las ${context}.`,
      confirmButtonColor: '#dc3545',
    });
  }

  goBack(): void {
    this.location.back();
  }

  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }
}

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { ClubApiService } from 'src/app/services/club-api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit, OnDestroy {

  private readonly clubApi = inject(ClubApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private userSub?: Subscription;
  public usuariosLoaded = false;

  miClub: IClubs | null = null;
  clubId: number | null = null;

  // Data
  usuarios: IUser[] = [];
  miembros: IUser[] = [];

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');

    if (idFromRoute) {
      // Caso B: Ver club desde otro usuario o tabla
      this.clubId = Number(idFromRoute);
      this.getMiClub();
    } else {
      // Caso A: Ver mi club (desde el usuario autenticado)
      this.userSub = this.auth.user$.subscribe(user => {
        console.log('Usuario autenticado recibido:', user);
        if (user?.clubId) {
          this.clubId = user.clubId;
          console.log('ID del club del usuario:', this.clubId);
          this.getMiClub();
        } else {
          this.miClub = null;
          this.clubId = null;
          Swal.fire('Sin Club', 'No tienes un club asociado', 'info');
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  /** Carga los datos del club asociado al usuario */
  getMiClub(): void {
    if (!this.clubId) {
      this.miClub = null;
      return;
    }

    this.clubApi.getClubById(this.clubId).subscribe({
      next: club => {
        this.miClub = club;
      },
      error: () => {
        this.miClub = null;
        Swal.fire('Error', 'No se pudieron cargar los datos de tu club', 'error');
      }
    });
  }

  /** Maneja error al cargar imagen */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  /** Retorna la URL base de la API */
  get apiUrl(): string {
    return this.clubApi.apiUrl;
  }

  // --- Helpers de vista para miClub ---
  hasMembers(): boolean {
    if (!this.miClub) return false;
    return Array.isArray(this.miClub.members) && this.miClub.members.length > 0;
  }
}

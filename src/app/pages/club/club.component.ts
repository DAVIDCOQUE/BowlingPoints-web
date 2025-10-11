import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit, OnDestroy {

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  public apiUrl = environment.apiUrl;

  private userSub?: Subscription;
  public usuariosLoaded = false;

  // UI State

  miClub: IClubs | null = null;
  id_Club?: number;
  clubId: number | null = null;

  // Data
  usuarios: IUser[] = [];
  miembros: IUser[] = [];

  ngOnInit(): void {

    this.userSub = this.auth.user$.subscribe(user => {
      if (user?.clubId) {
        this.clubId = user.clubId;
        this.getMiClub();
      } else {
        this.miClub = null;
        this.clubId = null;
        Swal.fire('Sin Club', 'No tienes un club asociado', 'info');
      }
    });

    this.getUsers();
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

    this.http.get<IClubs>(`${this.apiUrl}/clubs/${this.clubId}/details`)
      .subscribe({
        next: club => {
          this.miClub = club;
        },
        error: () => {
          this.miClub = null;
          Swal.fire('Error', 'No se pudieron cargar los datos de tu club', 'error');
        }
      });
  }

  /** Obtiene la lista de usuarios (una sola vez) */
  getUsers(forceRefresh: boolean = false): void {
    if (this.usuariosLoaded && !forceRefresh) return;

    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${this.apiUrl}/users`)
      .subscribe({
        next: res => {
          this.usuarios = res.data;
          this.usuariosLoaded = true;
        },
        error: () => {
          Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
      });
  }

  /** Maneja error al cargar imagen */
  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  // --- Helpers de vista para miClub ---

  hasMembers(): boolean {
    if (!this.miClub) return false;
    return Array.isArray(this.miClub.members) && this.miClub.members.length > 0;
  }
}

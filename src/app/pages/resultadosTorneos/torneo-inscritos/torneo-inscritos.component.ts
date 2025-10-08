import { Component, OnInit, OnDestroy, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-torneo-inscritos',
  templateUrl: './torneo-inscritos.component.html',
  styleUrls: ['./torneo-inscritos.component.css']
})
export class TorneoInscritosComponent implements OnInit, OnDestroy {
  readonly apiUrl = environment.apiUrl;

  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly modalService = inject(NgbModal);
  private readonly auth = inject(AuthService);

  private userSub?: Subscription;
  private usuariosLoaded = false;

  filter: string = '';
  miClub: IClubs | null = null;
  clubId: number | null = null;
  id_Club?: number;

  usuarios: IUser[] = [];
  miembros: IUser[] = [];

  clubForm!: FormGroup;

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.buildForm();

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

  private buildForm(): void {
    this.clubForm = this.fb.group({
      name: ['', Validators.required],
      foundationDate: ['', Validators.required],
      city: ['', Validators.required],
      description: ['', Validators.required],
      status: [true, Validators.required],
      members: ['', Validators.required],
      imageUrl: ['']
    });
  }

  getMiClub(): void {
    if (!this.clubId) return;

    this.http.get<IClubs>(`${this.apiUrl}/clubs/${this.clubId}/details`).subscribe({
      next: club => {
        this.miClub = club;
      },
      error: () => {
        this.miClub = null;
        Swal.fire('Error', 'No se pudieron cargar los datos de tu club', 'error');
      }
    });
  }

  getUsers(forceRefresh: boolean = false): void {
    if (this.usuariosLoaded && !forceRefresh) return;

    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${this.apiUrl}/users`).subscribe({
      next: res => {
        this.usuarios = res.data;
        this.usuariosLoaded = true;
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    });
  }

  save(): void {
    if (this.clubForm.invalid) {
      Swal.fire('Atención', 'Formulario inválido', 'warning');
      return;
    }

    const raw = this.clubForm.value;
    const members = (raw.members || []).map((id: number) => ({
      personId: id,
      roleInClub: 'ENTRENADOR'
    }));

    if (this.hasDuplicateMembers(members)) {
      Swal.fire('Error', 'No puedes agregar el mismo miembro dos veces.', 'error');
      return;
    }

    const payload = { ...raw, members };
    const url = this.id_Club
      ? `${this.apiUrl}/clubs/${this.id_Club}`
      : `${this.apiUrl}/clubs/create-with-members`;

    const request$ = this.id_Club
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => {
        const msg = this.id_Club ? 'actualizado' : 'creado';
        Swal.fire('Éxito', `El club fue ${msg} correctamente`, 'success');
        this.closeModal();
        if (this.clubId) this.getMiClub();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el club', 'error');
      }
    });
  }

  openModal(content: TemplateRef<unknown>, club?: IClubs): void {
    if (club) {
      this.id_Club = club.clubId;
      const memberIds = (club.members || []).map(m => m.personId);
      this.clubForm.patchValue({
        ...club,
        members: memberIds,
        imageUrl: club.imageUrl
      });
    } else {
      this.id_Club = undefined;
      this.clubForm.reset({ status: true });
    }

    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  clear(): void {
    this.filter = '';
  }

  onImgError(event: Event, defaultPath: string): void {
    const target = event.target as HTMLImageElement;
    target.src = defaultPath;
  }

  private hasDuplicateMembers(members: { personId: number }[]): boolean {
    const seen = new Set<number>();
    for (const m of members) {
      if (seen.has(m.personId)) return true;
      seen.add(m.personId);
    }
    return false;
  }

  // --- Helpers para UI ---
  showRanking(): boolean {
    return typeof this.miClub?.ranking === 'number' && this.miClub.ranking > 0;
  }

  showScore(): boolean {
    return typeof this.miClub?.score === 'number' && !isNaN(this.miClub.score);
  }

  hasLogros(): boolean {
    const logros = this.miClub?.logros;
    return Array.isArray(logros) && logros.length > 0;
  }

  hasTorneos(): boolean {
    const torneos = this.miClub?.torneos;
    return Array.isArray(torneos) && torneos.length > 0;
  }

  hasMembers(): boolean {
    const members = this.miClub?.members;
    return Array.isArray(members) && members.length > 0;
  }
}

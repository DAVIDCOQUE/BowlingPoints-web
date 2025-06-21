import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';

@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css'],
})
export class TorneosComponent {


  @ViewChild('modalTournament') modalTournamentRef: any;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filter: string = '';
  tournaments: ITournament[] = [];
  modalities: IModality[] = [];
  tournamentForm: FormGroup = new FormGroup({});
  idTournament: number | null = null;

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  causes = [
    { causeId: 1, name: 'En curso' },
    { causeId: 2, name: 'Programado' },
    { causeId: 3, name: 'En juego actualmente' },
    { causeId: 4, name: 'Finalizado correctamente' },
    { causeId: 5, name: 'Cancelado por mal clima' },
    { causeId: 6, name: 'Cancelado por fuerza mayor' },
    { causeId: 7, name: 'Suspendido por decisión técnica' },
    { causeId: 8, name: 'Aplazado por programación' },
    { causeId: 10, name: 'Reprogramado por logística' },
    { causeId: 11, name: 'Suspendido por problemas técnicos' },
    { causeId: 12, name: 'Cierre administrativo' }
  ];


  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getTournaments();
    this.getModalitys();
  }

  initForm(): void {
    this.tournamentForm = this.formBuilder.group({
      name: ['', Validators.required],
      modalityId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: ['', Validators.required],
      causeStatus: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  getTournaments(): void {
    this.http.get<{ success: boolean; message: string; data: ITournament[] }>(`${environment.apiUrl}/tournaments`)
      .subscribe({
        next: res => {
          this.tournaments = res.data;
          console.log('res:', res);

        },
        error: err => {
          console.error('Error al cargar torneoses:', err);
        }
      });
  }

  getModalitys(): void {
    this.http.get<{ success: boolean; message: string; data: IModality[] }>(`${environment.apiUrl}/modalities`)
      .subscribe({
        next: res => {
          this.modalities = res.data;
          console.log('res:', res);

        },
        error: err => {
          console.error('Error al cargar torneoses:', err);
        }
      });
  }

  get filteredTournaments(): ITournament[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.tournaments.filter(cat => cat.name.toLowerCase().includes(term))
      : this.tournaments;
  }

  openModal(content: any): void {
    if (!this.idTournament) {
      this.tournamentForm.reset();
    }
    this.modalService.open(content);
  }

  editTournament(tournament: ITournament): void {
    this.idTournament = tournament.tournamentId;
    this.tournamentForm.patchValue({ name: tournament.name });
    this.tournamentForm.patchValue({ modalityId: tournament.modalityId });
    this.tournamentForm.patchValue({ startDate: tournament.startDate });
    this.tournamentForm.patchValue({ endDate: tournament.endDate });
    this.tournamentForm.patchValue({ location: tournament.location });
    this.tournamentForm.patchValue({ causeStatus: tournament.causeStatus });
    this.tournamentForm.patchValue({ status: tournament.status });
    this.openModal(this.modalTournamentRef);
  }

  saveForm(): void {
    if (this.tournamentForm.invalid) {
      this.tournamentForm.markAllAsTouched();
      return;
    }

    const payload = this.tournamentForm.value;
    const isEdit = !!this.idTournament;
    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/tournaments/${this.idTournament}`, payload)
      : this.http.post(`${environment.apiUrl}/tournaments`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Torneos actualizada' : 'Torneos creada', 'success');
        this.getTournaments();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: err => {
        console.error('Error al guardar torneos:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
        this.isLoading$.next(false);
      }
    });
  }

  deleteTournament(id: number): void {
    Swal.fire({
      title: '¿Eliminar torneos?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/tournaments/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Torneos eliminada correctamente', 'success');
            this.getTournaments();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la torneos', 'error');
          }
        });
      }
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.tournamentForm.reset();
    this.idTournament = null;
  }

  search(): void {
    console.log('Filtro:', this.filter);
  }

  clear(): void {
    this.filter = '';
  }
}

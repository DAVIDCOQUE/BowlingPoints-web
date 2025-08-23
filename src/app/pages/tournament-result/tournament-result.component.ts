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
import { IResults } from 'src/app/model/result.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IRound } from 'src/app/model/round.interface';
import { ITeam } from 'src/app/model/team.interface';
import { IUser } from 'src/app/model/user.interface';
@Component({
  selector: 'app-tournament-result',
  templateUrl: './tournament-result.component.html',
  styleUrls: ['./tournament-result.component.css']
})
export class TournamentResultComponent {

  @ViewChild('modalResult') modalResultRef: any;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filter: string = '';
  torneo: any;

  selectedTournament: any = null;


  results: IResults[] = [];

  tournaments: ITournament[] = [];
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  rounds: IRound[] = [];
  persons: IUser[] = [];
  teams: ITeam[] = [];



  resultForm: FormGroup = new FormGroup({});
  idResult: number | null = null;

  laneNumbers = [
    { laneNumber: 1 },
    { laneNumber: 2 },
    { laneNumber: 3 },
    { laneNumber: 4, },
    { laneNumber: 5, },
    { laneNumber: 6 },
    { laneNumber: 7 },
    { laneNumber: 8 },
    { laneNumber: 10 },
    { laneNumber: 11 },
    { laneNumber: 12 }
  ];

  lineNumbers = [
    { lineNumber: 1 },
    { lineNumber: 2 },
    { lineNumber: 3 },
    { lineNumber: 4, },
    { lineNumber: 5, },
    { lineNumber: 6 },
    { lineNumber: 7 },
    { lineNumber: 8 },
    { lineNumber: 10 },
    { lineNumber: 11 },
    { lineNumber: 12 }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getResults();
    this.getTournaments();
    this.getModalitys();
    this.getRounds();
    this.getUser();
    this.getTeams();
    this.getCategorys();
  }

  initForm(): void {
    this.resultForm = this.formBuilder.group({
      personId: ['',],
      teamId: ['',],
      tournamentId: ['', Validators.required],
      categoryId: ['', Validators.required],
      modalityId: ['', Validators.required],
      roundId: ['', Validators.required],
      laneNumber: ['', Validators.required],
      lineNumber: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  getResults(): void {
    this.http.get<{ success: boolean; message: string; data: IResults[] }>(`${environment.apiUrl}/results`)
      .subscribe({
        next: res => {
          this.results = res.data;
          console.log('resultados:', res);

        },
        error: err => {
          console.error('Error al cargar Resultados:', err);
        }
      });
  }

  getTournaments(): void {
    this.http.get<{ success: boolean; message: string; data: ITournament[] }>(`${environment.apiUrl}/tournaments`)
      .subscribe({
        next: res => {
          this.tournaments = res.data;
        },
        error: err => {
          console.error('Error al cargar torneoses:', err);
        }
      });
  }

  getCategorys(): void {
    this.http.get<{ success: boolean; message: string; data: ICategory[] }>(`${environment.apiUrl}/categories`)
      .subscribe({
        next: res => {
          this.categories = res.data;
        },
        error: err => {
          console.error('Error al cargar modalidades:', err);
        }
      });
  }

  getModalitys(): void {
    this.http.get<{ success: boolean; message: string; data: IModality[] }>(`${environment.apiUrl}/modalities`)
      .subscribe({
        next: res => {
          this.modalities = res.data;
        },
        error: err => {
          console.error('Error al cargar modalidades:', err);
        }
      });
  }

  getRounds(): void {
    this.http.get<{ success: boolean; message: string; data: IRound[] }>(`${environment.apiUrl}/rounds`)
      .subscribe({
        next: res => {
          this.rounds = res.data;
        },
        error: err => {
          console.error('Error al cargar rondas:', err);
        }
      });
  }

  getUser(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(`${environment.apiUrl}/users`)
      .subscribe({
        next: res => {
          this.persons = res.data;
        },
        error: err => {
          console.error('Error al cargar usuarios:', err);
        }
      });
  }

  getTeams(): void {
    this.http.get<{ success: boolean; message: string; data: ITeam[] }>(`${environment.apiUrl}/teams`)
      .subscribe({
        next: res => {
          this.teams = res.data;
        },
        error: err => {
          console.error('Error al cargar equipos:', err);
        }
      });
  }

  get filteredResult(): IResults[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.results.filter(cat => cat.tournamentName.toLowerCase().includes(term))
      : this.results;
  }

  openModal(content: any): void {
    if (!this.idResult) {
      this.resultForm.reset();
    }
    this.modalService.open(content);
  }

  openModalResultados(content: any): void {
    this.modalService.open(content);
  }

  editResult(result: IResults): void {
    this.idResult = result.resultId;
    this.resultForm.patchValue({ personId: result.personId });
    this.resultForm.patchValue({ teamId: result.teamId });
    this.resultForm.patchValue({ tournamentId: result.tournamentId });
    this.resultForm.patchValue({ categoryId: result.categoryId });
    this.resultForm.patchValue({ roundId: result.roundId });
    this.resultForm.patchValue({ modalityId: result.modalityId });
    this.resultForm.patchValue({ laneNumber: result.laneNumber });
    this.resultForm.patchValue({ lineNumber: result.lineNumber });
    this.resultForm.patchValue({ score: result.score });
    this.openModal(this.modalResultRef);
  }
  saveForm(): void {
    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      return;
    }

    const payload = this.resultForm.value;
    const isEdit = !!this.idResult;
    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/results/${this.idResult}`, payload)
      : this.http.post(`${environment.apiUrl}/results`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Torneos actualizada' : 'Torneos creada', 'success');
        this.getResults();
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

  deleteResult(id: number): void {
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
        this.http.delete(`${environment.apiUrl}/results/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Torneos eliminada correctamente', 'success');
            this.getResults();
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
    this.resultForm.reset();
    this.idResult = null;
  }

  search(): void {
    console.log('Filtro:', this.filter);
  }

  clear(): void {
    this.filter = '';
  }
}


import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';

import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IResults } from 'src/app/model/result.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IRound } from 'src/app/model/round.interface';
import { ITeam } from 'src/app/model/team.interface';
import { IUser } from 'src/app/model/user.interface';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  @ViewChild('modalResult') modalResultRef: unknown;

  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  public isLoading$ = new BehaviorSubject<boolean>(false);

  public filter: string = '';
  public results: IResults[] = [];
  public tournaments: ITournament[] = [];
  public categories: ICategory[] = [];
  public modalities: IModality[] = [];
  public rounds: IRound[] = [];
  public persons: IUser[] = [];
  public teams: ITeam[] = [];

  public resultForm: FormGroup = new FormGroup({});
  public idResult: number | null = null;

  public readonly laneNumbers = Array.from({ length: 12 }, (_, i) => ({ laneNumber: i + 1 }));
  public readonly lineNumbers = Array.from({ length: 12 }, (_, i) => ({ lineNumber: i + 1 }));

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  /**
   * Inicializa el formulario con sus validaciones.
   */
  private initForm(): void {
    this.resultForm = this.formBuilder.group({
      personId: [''],
      teamId: [''],
      tournamentId: ['', Validators.required],
      categoryId: ['', Validators.required],
      modalityId: ['', Validators.required],
      roundId: ['', Validators.required],
      laneNumber: ['', Validators.required],
      lineNumber: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  /**
   * Carga datos iniciales para el formulario.
   */
  private loadInitialData(): void {
    this.getResults();
    this.getTournaments();
    this.getModalitys();
    this.getRounds();
    this.getUsers();
    this.getTeams();
    this.getCategories();
  }

  /**
   * Obtiene los resultados desde la API.
   */
  private getResults(): void {
    this.http.get<{ success: boolean; message: string; data: IResults[] }>(
      `${environment.apiUrl}/results`
    ).subscribe({
      next: res => {
        this.results = res.data;
      },
    });
  }

  private getTournaments(): void {
    this.http.get<{ success: boolean; message: string; data: ITournament[] }>(
      `${environment.apiUrl}/tournaments`
    ).subscribe({
      next: res => {
        this.tournaments = res.data;
      },
    });
  }

  private getCategories(): void {
    this.http.get<{ success: boolean; message: string; data: ICategory[] }>(
      `${environment.apiUrl}/categories`
    ).subscribe({
      next: res => {
        this.categories = res.data;
      },
    });
  }

  private getModalitys(): void {
    this.http.get<{ success: boolean; message: string; data: IModality[] }>(
      `${environment.apiUrl}/modalities`
    ).subscribe({
      next: res => {
        this.modalities = res.data;
      },
    });
  }

  private getRounds(): void {
    this.http.get<{ success: boolean; message: string; data: IRound[] }>(
      `${environment.apiUrl}/rounds`
    ).subscribe({
      next: res => {
        this.rounds = res.data;
      },
    });
  }

  private getUsers(): void {
    this.http.get<{ success: boolean; message: string; data: IUser[] }>(
      `${environment.apiUrl}/users`
    ).subscribe({
      next: res => {
        this.persons = res.data;
      },
    });
  }

  private getTeams(): void {
    this.http.get<{ success: boolean; message: string; data: ITeam[] }>(
      `${environment.apiUrl}/teams`
    ).subscribe({
      next: res => {
        this.teams = res.data;
      },
    });
  }

  /**
   * Devuelve resultados filtrados por nombre del torneo.
   */
  get filteredResult(): IResults[] {
    const term = this.filter.toLowerCase().trim();

    return term
      ? this.results.filter(result =>
        result.tournament?.name?.toLowerCase().includes(term)
      )
      : this.results;
  }

  /**
   * Abre el modal de formulario para crear/editar.
   */
  openModal(content: unknown): void {
    if (!this.idResult) {
      this.resultForm.reset();
    }
    this.modalService.open(content);
  }

  /**
   * Abre el modal de solo visualización de resultados.
   */
  openModalResultados(content: unknown): void {
    this.modalService.open(content);
  }

  /**
   * Carga los datos de un resultado en el formulario para editar.
   */
  editResult(result: IResults): void {
    this.idResult = result.resultId;
    this.resultForm.patchValue(result);
    this.openModal(this.modalResultRef);
  }

  /**
   * Guarda o actualiza un resultado en la base de datos.
   */
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
        this.getResults();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: () => {
        this.isLoading$.next(false);
      }
    });
  }

  /**
   * Elimina un resultado seleccionado.
   */
  deleteResult(id: number): void {
    this.http.delete(`${environment.apiUrl}/results/${id}`).subscribe({
      next: () => {
        this.getResults();
      },
    });
  }

  /**
   * Cierra todos los modales abiertos.
   */
  closeModal(): void {
    this.modalService.dismissAll();
    this.resultForm.reset();
    this.idResult = null;
  }

  /**
   * Llama manualmente al filtro de búsqueda.
   */
  search(): void {
    // Método preparado para búsquedas manuales
  }

  /**
   * Limpia el filtro de búsqueda.
   */
  clear(): void {
    this.filter = '';
  }
}

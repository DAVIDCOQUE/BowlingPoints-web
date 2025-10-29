import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

// Interfaces
import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IResults } from 'src/app/model/result.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IRound } from 'src/app/model/round.interface';
import { ITeam } from 'src/app/model/team.interface';
import { IUser } from 'src/app/model/user.interface';

// Servicios
import { ResultsService } from 'src/app/services/results.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  @ViewChild('modalResult') modalResultRef!: unknown;

  private readonly resultsService = inject(ResultsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  public isLoading$ = new BehaviorSubject<boolean>(false);

  public filter = '';
  public results: IResults[] = [];
  public tournaments: ITournament[] = [];
  public categories: ICategory[] = [];
  public modalities: IModality[] = [];
  public persons: IUser[] = [];
  public teams: ITeam[] = [];

  public resultForm!: FormGroup;
  public idResult: number | null = null;

  public readonly laneNumbers = Array.from({ length: 12 }, (_, i) => ({ laneNumber: i + 1 }));
  public readonly lineNumbers = Array.from({ length: 12 }, (_, i) => ({ lineNumber: i + 1 }));

  roundNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  private initForm(): void {
    this.resultForm = this.formBuilder.group({
      personId: [''],
      teamId: [''],
      tournamentId: ['', Validators.required],
      categoryId: ['', Validators.required],
      modalityId: ['', Validators.required],
      rama: ['', Validators.required],
      roundId: ['', Validators.required],
      laneNumber: ['', Validators.required],
      lineNumber: ['', Validators.required],
      score: ['', Validators.required],
    });
  }

  private loadInitialData(): void {
    this.getResults();
    this.getTournaments();
    this.getModalitys();
    this.getUsers();
    this.getTeams();
    this.getCategories();
  }

  private getResults(): void {
    this.resultsService.getResults().subscribe({
      next: (res) => (this.results = res.data),
      error: (err) => console.error('Error al cargar resultados:', err),
    });
  }

  private getTournaments(): void {
    this.resultsService.getTournaments().subscribe({
      next: (res) => (this.tournaments = res.data),
    });
  }

  private getCategories(): void {
    this.resultsService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
    });
  }

  private getModalitys(): void {
    this.resultsService.getModalities().subscribe({
      next: (res) => (this.modalities = res.data),
    });
  }

  private getUsers(): void {
    this.resultsService.getUsers().subscribe({
      next: (res) => (this.persons = res.data),
    });
  }

  private getTeams(): void {
    this.resultsService.getTeams().subscribe({
      next: (res) => (this.teams = res.data),
    });
  }

  get filteredResult(): IResults[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.results.filter((r) =>
        r.tournamentName?.toLowerCase().includes(term)
      )
      : this.results;
  }

  openModal(content: unknown): void {
    if (!this.idResult) this.resultForm.reset({ rama: 'masculino' });
    this.modalService.open(content);
  }

  editResult(result: IResults): void {
    this.idResult = result.resultId;
    this.resultForm.patchValue(result);
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
      ? this.resultsService.updateResult(this.idResult!, payload)
      : this.resultsService.createResult(payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Resultado actualizado' : 'Resultado creado', 'success');
        this.getResults();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: (err) => {
        console.error('Error al guardar resultado:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
        this.isLoading$.next(false);
      },
    });
  }

  deleteResult(id: number): void {
    Swal.fire({
      title: '¿Eliminar resultado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.resultsService.deleteResult(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
            this.getResults();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el resultado', 'error');
          },
        });
      }
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.resultForm.reset({ rama: 'masculino' });
    this.idResult = null;
  }

  clear(): void {
    this.filter = '';
  }
}

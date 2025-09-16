import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { ICategory } from 'src/app/model/category.interface';
import { dateRangeValidator } from 'src/app/shared/validators/date-range.validator';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
} from 'rxjs/operators';
import { CitiesService, CityDto } from 'src/app/services/cities.service';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css'],
})
export class TorneosComponent {
  @ViewChild('modalTournament') modalTournamentRef: any;
  @ViewChild('modalSetResultTournament') modalSetResultTournamentRef: any;

  filter: string = '';
  tournaments: ITournament[] = [];
  idTournament: number | null = null;

  modalities: IModality[] = [];
  categoris: ICategory[] = [];
  ambits: IAmbit[] = [];

  tournamentForm: FormGroup = new FormGroup({});

  selectedTournament: any = null;

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];

  causes = [
    { causeId: 1, name: 'Programado' },
    { causeId: 2, name: 'En curso' },
    { causeId: 3, name: 'Aplazado' },
    { causeId: 4, name: 'Finalizado' },
    { causeId: 5, name: 'Cancelado' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal,
    private cities: CitiesService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getTournaments();
    this.getModalitys();
    this.getCategories();
    this.getAmbits();
  }

  initForm(): void {
    this.tournamentForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        organizer: ['', Validators.required],
        modalityIds: ['', Validators.required],
        categoryIds: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        ambitId: ['', Validators.required],
        // ⬇️ nuevo control “canónico”
        cityId: [null, Validators.required],
        // ⬇️ se sigue mostrando en la tabla, lo rellenaremos al seleccionar
        location: ['', [Validators.required, Validators.maxLength(60)]],
        causeStatus: ['', Validators.required],
        status: ['', Validators.required],
      },
      {
        // ⬇️ Valida que startDate < endDate
        validators: dateRangeValidator('startDate', 'endDate', {
          allowEqual: true,
        }),
      }
    );
  }

  getTournaments(): void {
    this.http
      .get<{ success: boolean; message: string; data: ITournament[] }>(
        `${environment.apiUrl}/tournaments`
      )
      .subscribe({
        next: (res) => {
          this.tournaments = res.data;
          console.log(this.tournaments);
        },
        error: (err) => {
          console.error('Error al cargar torneoses:', err);
        },
      });
  }

  getModalitys(): void {
    this.http
      .get<{ success: boolean; message: string; data: IModality[] }>(
        `${environment.apiUrl}/modalities`
      )
      .subscribe({
        next: (res) => {
          this.modalities = res.data;
        },
        error: (err) => {
          console.error('Error al cargar torneoses:', err);
        },
      });
  }

  getCategories(): void {
    this.http
      .get<{ success: boolean; message: string; data: ICategory[] }>(
        `${environment.apiUrl}/categories`
      )
      .subscribe({
        next: (res) => {
          this.categoris = res.data;
        },
        error: (err) => {
          console.error('Error al cargar torneoses:', err);
        },
      });
  }

  getAmbits(): void {
    this.http
      .get<{ success: boolean; message: string; data: IAmbit[] }>(
        `${environment.apiUrl}/ambits`
      )
      .subscribe({
        next: (res) => {
          this.ambits = res.data;
        },
        error: (err) => {
          console.error('Error al cargar torneoses:', err);
        },
      });
  }

  get filteredTournaments(): ITournament[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.tournaments.filter((cat) => cat.name.toLowerCase().includes(term))
      : this.tournaments;
  }

  editTournament(tournament: ITournament): void {
    this.idTournament = tournament.tournamentId;
    this.tournamentForm.patchValue({ name: tournament.name });
    this.tournamentForm.patchValue({ organizer: tournament.organizer });
    this.tournamentForm.patchValue({ categoryIds: tournament.categoryIds });
    this.tournamentForm.patchValue({ modalityIds: tournament.modalityIds });
    this.tournamentForm.patchValue({ startDate: tournament.startDate });
    this.tournamentForm.patchValue({ endDate: tournament.endDate });
    this.tournamentForm.patchValue({ ambitId: tournament.ambitId });
    this.tournamentForm.patchValue({
      cityId: (tournament as any).cityId ?? null,
    });
    this.tournamentForm.patchValue({ location: tournament.location });
    this.tournamentForm.patchValue({ causeStatus: tournament.causeStatus });
    this.tournamentForm.patchValue({ status: tournament.status });

    // ⬇️ Recalcula el validador cruzado después de patchValue
    this.tournamentForm.updateValueAndValidity({
      onlySelf: false,
      emitEvent: false,
    });

    this.openModal(this.modalTournamentRef);
  }

  saveForm(): void {
    if (this.tournamentForm.invalid) {
      this.tournamentForm.markAllAsTouched();
      return;
    }

    const payload = this.tournamentForm.value;
    const isEdit = !!this.idTournament;

    const request = isEdit
      ? this.http.put(
          `${environment.apiUrl}/tournaments/${this.idTournament}`,
          payload
        )
      : this.http.post(`${environment.apiUrl}/tournaments`, payload);

    request.subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          isEdit ? 'Torneos actualizada' : 'Torneos creada',
          'success'
        );
        this.getTournaments();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar torneos:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      },
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/tournaments/${id}`).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              'Torneos eliminada correctamente',
              'success'
            );
            this.getTournaments();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la torneos', 'error');
          },
        });
      }
    });
  }

  openModalSetResultTournament(tournament: any) {
    this.selectedTournament = tournament;
    // Aquí abres el modal y pasas el tamaño 'xl'
    this.modalService.open(this.modalSetResultTournamentRef, { size: 'xl' });
  }

  openModal(content: any): void {
    if (!this.idTournament) {
      this.tournamentForm.reset();
    }
    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.tournamentForm.reset();
    this.idTournament = null;
  }

  clear(): void {
    this.filter = '';
  }

  // dentro de export class TorneosComponent { ... }
  toYMDStrict(v: any): string | null {
    if (!v) return null;
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  cityLoading = false;
  searchCities = (text$: Observable<string>): Observable<CityDto[]> => {
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.cityLoading = true)),
      switchMap((term) => this.cities.search(term, 10 /*limit*/)), // puedes pasar 'CO' como 3er arg si quieres limitar por país
      tap(() => (this.cityLoading = false)),
      catchError(() => {
        this.cityLoading = false;
        return of([]);
      })
    );
  };

  formatResult = (c: CityDto) =>
    `${c.name}, ${c.countryName}${c.admin1 ? ' — ' + c.admin1 : ''}`;
  formatInput = (c: CityDto | string) =>
    typeof c === 'string' ? c : `${c.name}, ${c.countryName}`;

  // Si el usuario escribe y no selecciona una opción, invalida:
  onLocationBlur() {
    const cityId = this.tournamentForm.get('cityId')!.value;
    const location = this.tournamentForm.get('location')!.value;
    if (!cityId || !location) {
      this.tournamentForm.get('cityId')!.setValue(null);
      this.tournamentForm.get('location')!.setErrors({ required: true });
    }
  }

  // Cuando selecciona una ciudad:
  onCitySelected(e: NgbTypeaheadSelectItemEvent<CityDto>) {
    const city = e.item;
    this.tournamentForm.patchValue({
      cityId: city.id,
      location: `${city.name}, ${city.countryName}`,
    });
  }
}

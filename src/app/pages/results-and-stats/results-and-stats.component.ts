import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IResults } from '../../model/result.interface';
import { ICategory } from '../../model/category.interface';

@Component({
  selector: 'app-results-and-stats',
  templateUrl: './results-and-stats.component.html',
  styleUrls: ['./results-and-stats.component.css']
})
export class ResultsAndStatsComponent implements OnInit {

  // Referencia al template del modal. Tipar evita usar `any`.
  @ViewChild('modalResult', { static: false }) modalResultRef!: TemplateRef<unknown>;

  // Indicador de carga reactivo por si se quiere enlazar en plantilla.
  isLoading$ = new BehaviorSubject<boolean>(false);

  // Estado principal
  selectedTournament: ITournament | null = null;
  tournaments: ITournament[] = [];
  results: IResults[] = [];
  filteredResults: IResults[] = [];

  // Filtros
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  selectedCategory = '';
  selectedModality = '';
  selectedRama = '';

  // Archivo seleccionado para importación
  selectedFile: File | null = null;

  // Centralizamos la URL base para evitar repetir `environment.apiUrl`
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly modalService: NgbModal
  ) { }

  // ----------------------------------------------------------
  // Ciclo de vida
  // ----------------------------------------------------------
  ngOnInit(): void {
    this.loadTournaments();
    this.loadCategories();
    this.loadModalities();
    this.loadResults();
  }

  // ----------------------------------------------------------
  // Carga de datos desde el backend
  // ----------------------------------------------------------
  loadTournaments(): void {
    this.http
      .get<{ success: boolean; data: ITournament[] }>(`${this.apiUrl}/tournaments`)
      .subscribe({
        next: (res) => {
          this.tournaments = res.data ?? [];
          // Para pruebas o UX básica, seleccionar el primero si existe
          this.selectedTournament = this.tournaments.length ? this.tournaments[0] : null;
        },
        error: (err) => console.error('Error al cargar torneos:', err),
      });
  }

  loadCategories(): void {
    this.http
      .get<{ success: boolean; data: ICategory[] }>(`${this.apiUrl}/categories`)
      .subscribe({
        next: (res) => (this.categories = res.data ?? []),
        error: (err) => console.error('Error al cargar categorías:', err),
      });
  }

  loadModalities(): void {
    this.http
      .get<{ success: boolean; data: IModality[] }>(`${this.apiUrl}/modalities`)
      .subscribe({
        next: (res) => (this.modalities = res.data ?? []),
        error: (err) => console.error('Error al cargar modalidades:', err),
      });
  }

  loadResults(): void {
    this.http
      .get<{ success: boolean; data: IResults[] }>(`${this.apiUrl}/results`)
      .subscribe({
        next: (res) => {
          this.results = res.data ?? [];
          this.filteredResults = this.results;
        },
        error: (err) => console.error('Error al cargar resultados:', err),
      });
  }

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  onFilterChange(): void {
    this.filteredResults = this.results.filter((r) =>
      // (!this.selectedCategory || r.category?.categoryId === Number(this.selectedCategory)) &&
      // (!this.selectedModality || r.modality?.modalityId === Number(this.selectedModality)) &&
      (!this.selectedRama || r.rama?.toLowerCase() === this.selectedRama.toLowerCase())
    );
  }

  // ----------------------------------------------------------
  // Carga de archivo Excel
  // ----------------------------------------------------------
  openFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (event) => this.onFileSelected(event as Event);
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    Swal.fire({
      icon: 'info',
      title: 'Archivo seleccionado',
      text: `Archivo: ${file.name}`,
      confirmButtonText: 'Aceptar',
    });

    // Aquí se puede implementar importación con XLSX cuando corresponda:
    // this.importExcel(file);
  }

  // ----------------------------------------------------------
  // Acciones sobre resultados
  // ----------------------------------------------------------
  editResult(result: IResults): void {
    this.modalService.open(this.modalResultRef);
    // Mantener logs de desarrollo con moderación
    // console.log('Editar resultado', result);
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/results/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
            this.loadResults();
          },
          // Importante: el callback no debe devolver una Promesa.
          // Usamos un cuerpo de función con llaves para garantizar `void`.
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el resultado', 'error');
          },
        });
      }
    });
  }

  // ----------------------------------------------------------
  // Modales
  // ----------------------------------------------------------
  openModal(content: TemplateRef<unknown>): void {
    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}

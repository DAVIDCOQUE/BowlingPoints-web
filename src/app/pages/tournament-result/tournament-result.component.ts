import { Component, ViewChild } from '@angular/core';
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
  selector: 'app-tournament-result',
  templateUrl: './tournament-result.component.html',
  styleUrls: ['./tournament-result.component.css']
})
export class TournamentResultComponent {

  @ViewChild('modalResult') modalResultRef: any;
  isLoading$ = new BehaviorSubject<boolean>(false);

  selectedTournament: ITournament | null = null;
  tournaments: ITournament[] = [];
  results: IResults[] = [];
  filteredResults: IResults[] = [];

  categories: ICategory[] = [];
  modalities: IModality[] = [];
  selectedCategory: string = '';
  selectedModality: string = '';
  selectedRama: string = '';

  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  // ==========================================================
  // 🔹 INICIALIZACIÓN
  // ==========================================================
  ngOnInit(): void {
    this.loadTournaments();
    this.loadCategories();
    this.loadModalities();
    this.loadResults();
  }

  // ==========================================================
  // 📡 CARGA DE DATOS DESDE EL BACKEND
  // ==========================================================
  loadTournaments(): void {
    this.http.get<{ success: boolean; data: ITournament[] }>(`${environment.apiUrl}/tournaments`)
      .subscribe({
        next: res => {
          this.tournaments = res.data;
          // Para pruebas, seleccionamos el primero automáticamente
          this.selectedTournament = this.tournaments[0] || null;
        },
        error: err => console.error('Error al cargar torneos:', err)
      });
  }

  loadCategories(): void {
    this.http.get<{ success: boolean; data: ICategory[] }>(`${environment.apiUrl}/categories`)
      .subscribe({
        next: res => this.categories = res.data,
        error: err => console.error('Error al cargar categorías:', err)
      });
  }

  loadModalities(): void {
    this.http.get<{ success: boolean; data: IModality[] }>(`${environment.apiUrl}/modalities`)
      .subscribe({
        next: res => this.modalities = res.data,
        error: err => console.error('Error al cargar modalidades:', err)
      });
  }

  loadResults(): void {
    this.http.get<{ success: boolean; data: IResults[] }>(`${environment.apiUrl}/results`)
      .subscribe({
        next: res => {
          this.results = res.data;
          this.filteredResults = res.data;
        },
        error: err => console.error('Error al cargar resultados:', err)
      });
  }

  // ==========================================================
  // 🧮 FILTROS
  // ==========================================================
  onFilterChange(): void {
    this.filteredResults = this.results.filter(r =>
      (!this.selectedCategory || r.category?.categoryId === +this.selectedCategory) &&
      (!this.selectedModality || r.modality?.modalityId === +this.selectedModality) &&
      (!this.selectedRama || r.rama?.toLowerCase() === this.selectedRama.toLowerCase())
    );
  }

  // ==========================================================
  // 📤 CARGA DE ARCHIVO EXCEL
  // ==========================================================
  openFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (event: any) => this.onFileSelected(event);
    input.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    Swal.fire({
      icon: 'info',
      title: 'Archivo seleccionado',
      text: `Archivo: ${file.name}`,
      confirmButtonText: 'Aceptar'
    });

    // Aquí luego podrás implementar la lógica con XLSX
    // this.importExcel(file);
  }

  // ==========================================================
  // 🗑️ ACCIONES DE RESULTADOS
  // ==========================================================
  editResult(result: IResults): void {
    this.modalService.open(this.modalResultRef);
    console.log('Editar resultado', result);
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
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/results/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
            this.loadResults();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el resultado', 'error')
        });
      }
    });
  }

  // ==========================================================
  // 🔚 MODALES
  // ==========================================================
  openModal(content: any): void {
    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface Torneo {
  id: number;
  img: string;
  nombre: string;
  fecha: string; // ISO string: yyyy-MM-dd
  lugar: string;
  modalidad: string;
  categoria: string;
}

@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css'],
})
export class TorneosComponent {
  filtrosForm!: FormGroup;
  filter: string = '';
  hitorial_torneos: any;
  id_torneo: number | null = null;

  modalidad = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  categoria = [
    { value: 'Sub-18', label: 'Sub-18' },
    { value: 'Sub-21', label: 'Sub-21' },
    { value: 'Mayores', label: 'Mayores' },
    { value: 'Libre', label: 'Libre' },
    { value: 'Todas las categorías', label: 'Todas las categorías' },
  ];

  fecha = [
    { value: 'maq1', label: 'Máquina 1' },
    { value: 'maq2', label: 'Máquina 2' },
  ];

  /* -------------  MODAL ------------- */
  isModalOpen = false;
  nuevoTorneo: Omit<Torneo, 'id' | 'img'> = this.vaciarTorneo();

  constructor(
    private ResultadosService: ResultadosService,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.get_hitorial_torneos();
  }

  initForm() {
    this.filtrosForm = this.formBuilder.group({
      fecha: [null],
      modalidad: [null],
      categoria: [null],
    });
  }

  get_hitorial_torneos() {
    this.ResultadosService.get_hitorial_torneos().subscribe(
      (hitorial_torneos) => {
        this.hitorial_torneos = hitorial_torneos;
        console.log(this.hitorial_torneos);
      }
    );
  }

  clear() {
    this.hitorial_torneos = null;
  }

  search() { }

  /** Abre modal */
  openModal(content: any) {
    this.nuevoTorneo = this.vaciarTorneo();
    this.modalService.open(content);
  }

  /** Detener la burbuja */
  onDialogClick(evt: MouseEvent): void {
    evt.stopPropagation();
  }

  /** Cierra solo desde el overlay o Cancelar */
  closeModal(): void {
    this.modalService.dismissAll()
  }

  /** Guarda el torneo y actualiza la tabla inmediatamente */
  saveTournament(frm: any): void {
    if (frm.invalid) return;

    // Generar ID secuencial local (si el backend no lo devuelve)
    const nextId =
      this.hitorial_torneos.length > 0
        ? Math.max(...this.hitorial_torneos.map((t: Torneo) => t.id)) + 1
        : 1;

    const torneo: Torneo = {
      id: nextId,
      img: 'assets/img/bola-boliche.png', // placeholder; cámbialo si subes imagen real
      ...this.nuevoTorneo,
    };

    /* ── 1) Actualizar vista inmediatamente ── */
    this.hitorial_torneos.push(torneo);

    this.isModalOpen = false;
  }

  /* ===== Utils ===== */
  private vaciarTorneo(): Omit<Torneo, 'id' | 'img'> {
    return {
      nombre: '',
      fecha: '',
      lugar: '',
      modalidad: '',
      categoria: '',
    };
  }



}

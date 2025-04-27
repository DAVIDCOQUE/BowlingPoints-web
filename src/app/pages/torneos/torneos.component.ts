import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResultadosService } from 'src/app/services/resultados.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css']
})
export class TorneosComponent {

  filtrosForm!: FormGroup;
  filter: string = '';
  hitorial_torneos: any;


  modalidad = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  categoria = [
    { value: 'mañana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'noche', label: 'Noche' },
  ];

  fecha = [
    { value: 'maq1', label: 'Máquina 1' },
    { value: 'maq2', label: 'Máquina 2' },
  ];


  constructor(private ResultadosService: ResultadosService, private router: Router, private formBuilder: FormBuilder,) { }

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
    this.ResultadosService.get_hitorial_torneos().subscribe(hitorial_torneos => {
      this.hitorial_torneos = hitorial_torneos;
      console.log(this.hitorial_torneos);
    }
    )
  }


  clear() {
    this.hitorial_torneos = null;
  }

  search() {

  }
}

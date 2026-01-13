import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ITeam } from 'src/app/model/team.interface';
import { TeamApiService } from 'src/app/services/team-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  @ViewChild('modalTeam', { static: true }) modalTeam!: TemplateRef<unknown>;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly teamApi = inject(TeamApiService);

  public filter = '';
  public teams: ITeam[] = [];
  public idTeam: number | null = null;

  public teamForm: FormGroup = new FormGroup({});

  public readonly estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.getTeams();
  }

  private initForm(): void {
    this.teamForm = this.fb.group({
      nameTeam: ['', Validators.required],
      phone: [''],
      status: ['', Validators.required]
    });
  }

  public getTeams(): void {
    this.teamApi.getTeams().subscribe({
      next: teams => this.teams = teams
    });
  }

  get filteredTeams(): ITeam[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.teams.filter(t => t.nameTeam.toLowerCase().includes(term))
      : this.teams;
  }

  public editTeam(team: ITeam): void {
    this.idTeam = team.teamId;
    this.teamForm.patchValue({
      nameTeam: team.nameTeam,
      phone: team.phone,
      status: team.status
    });
    this.openModal(this.modalTeam);
  }

  public saveForm(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    const payload = this.teamForm.value;
    const isEdit = !!this.idTeam;

    const request = isEdit
      ? this.teamApi.updateTeam(this.idTeam!, payload)
      : this.teamApi.createTeam(payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Equipo actualizado' : 'Equipo creado', 'success');
        this.getTeams();
        this.closeModal();
      },
      error: err => {
        console.error('Error al guardar Equipo:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      }
    });
  }

  public deleteTeam(id: number): void {
    Swal.fire({
      title: '¿Eliminar Equipo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.teamApi.deleteTeam(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Equipo eliminado con éxito', 'success');
            this.getTeams();
          },
          error: err => {
            console.error('Error al eliminar Equipo:', err);
            Swal.fire('Error', err.error?.message || 'No se pudo eliminar', 'error');
          }
        });
      }
    });
  }

  public clear(): void {
    this.filter = '';
  }

  public openModal(template: TemplateRef<unknown>): void {
    this.modalService.open(template, { size: 'lg', centered: true });
  }

  public closeModal(): void {
    this.modalService.dismissAll();
    this.teamForm.reset();
    this.idTeam = null;
  }
}

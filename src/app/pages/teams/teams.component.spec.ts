import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';

import { TeamsComponent } from './teams.component';
import { TeamApiService } from 'src/app/services/team-api.service';
import { ITeam } from 'src/app/model/team.interface';

describe('TeamsComponent', () => {
  let component: TeamsComponent;
  let fixture: ComponentFixture<TeamsComponent>;
  let teamApiSpy: jasmine.SpyObj<TeamApiService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;

  const mockTeams: ITeam[] = [
    { teamId: 1, nameTeam: 'Team Alpha', phone: '123456', status: true },
    { teamId: 2, nameTeam: 'Team Beta', phone: '789012', status: false },
    { teamId: 3, nameTeam: 'Gamma Squad', phone: '345678', status: true }
  ];

  beforeEach(async () => {
    teamApiSpy = jasmine.createSpyObj('TeamApiService', ['getTeams', 'createTeam', 'updateTeam', 'deleteTeam']);
    teamApiSpy.getTeams.and.returnValue(of(mockTeams));

    modalSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [TeamsComponent],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: TeamApiService, useValue: teamApiSpy },
        { provide: NgbModal, useValue: modalSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load teams on init', () => {
    expect(teamApiSpy.getTeams).toHaveBeenCalled();
    expect(component.teams.length).toBe(3);
  });

  it('should initialize form with required validators', () => {
    expect(component.teamForm).toBeTruthy();
    expect(component.teamForm.get('nameTeam')).toBeTruthy();
    expect(component.teamForm.get('phone')).toBeTruthy();
    expect(component.teamForm.get('status')).toBeTruthy();
  });

  describe('filteredTeams', () => {
    it('should return all teams when filter is empty', () => {
      component.filter = '';
      expect(component.filteredTeams.length).toBe(3);
    });

    it('should filter teams by name (case insensitive)', () => {
      component.filter = 'alpha';
      expect(component.filteredTeams.length).toBe(1);
      expect(component.filteredTeams[0].nameTeam).toBe('Team Alpha');
    });

    it('should filter teams with partial match', () => {
      component.filter = 'Team';
      expect(component.filteredTeams.length).toBe(2);
    });

    it('should return empty array when no match found', () => {
      component.filter = 'xyz';
      expect(component.filteredTeams.length).toBe(0);
    });

    it('should trim whitespace from filter', () => {
      component.filter = '  beta  ';
      expect(component.filteredTeams.length).toBe(1);
    });
  });

  describe('editTeam', () => {
    it('should set idTeam and patch form values', () => {
      const team = mockTeams[0];
      component.editTeam(team);

      expect(component.idTeam).toBe(team.teamId);
      expect(component.teamForm.value.nameTeam).toBe(team.nameTeam);
      expect(component.teamForm.value.phone).toBe(team.phone);
      expect(component.teamForm.value.status).toBe(team.status);
    });

    it('should open modal when editing', () => {
      component.editTeam(mockTeams[0]);
      expect(modalSpy.open).toHaveBeenCalled();
    });
  });

  describe('saveForm', () => {
    it('should not save if form is invalid', () => {
      component.teamForm.reset();
      component.saveForm();
      expect(teamApiSpy.createTeam).not.toHaveBeenCalled();
      expect(teamApiSpy.updateTeam).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched if form is invalid', () => {
      component.teamForm.reset();
      const markSpy = spyOn(component.teamForm, 'markAllAsTouched');
      component.saveForm();
      expect(markSpy).toHaveBeenCalled();
    });

    it('should create team when idTeam is null', fakeAsync(() => {
      spyOn(Swal, 'fire');
      teamApiSpy.createTeam.and.returnValue(of({}));

      component.idTeam = null;
      component.teamForm.patchValue({
        nameTeam: 'New Team',
        phone: '123',
        status: true
      });

      component.saveForm();
      tick();

      expect(teamApiSpy.createTeam).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Equipo creado', 'success');
    }));

    it('should update team when idTeam exists', fakeAsync(() => {
      spyOn(Swal, 'fire');
      teamApiSpy.updateTeam.and.returnValue(of({}));

      component.idTeam = 1;
      component.teamForm.patchValue({
        nameTeam: 'Updated Team',
        phone: '456',
        status: false
      });

      component.saveForm();
      tick();

      expect(teamApiSpy.updateTeam).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Equipo actualizado', 'success');
    }));

    it('should show error when save fails', fakeAsync(() => {
      spyOn(Swal, 'fire');
      spyOn(console, 'error');
      teamApiSpy.createTeam.and.returnValue(throwError(() => ({ error: { message: 'Error de servidor' } })));

      component.idTeam = null;
      component.teamForm.patchValue({
        nameTeam: 'New Team',
        phone: '123',
        status: true
      });

      component.saveForm();
      tick();

      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error de servidor', 'error');
      expect(console.error).toHaveBeenCalled();
    }));

    it('should show default error message when no message provided', fakeAsync(() => {
      spyOn(Swal, 'fire');
      spyOn(console, 'error');
      teamApiSpy.createTeam.and.returnValue(throwError(() => ({})));

      component.idTeam = null;
      component.teamForm.patchValue({
        nameTeam: 'New Team',
        phone: '123',
        status: true
      });

      component.saveForm();
      tick();

      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Algo salió mal', 'error');
    }));
  });

  describe('deleteTeam', () => {
    it('should show confirmation dialog', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);

      component.deleteTeam(1);
      tick();

      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should delete team when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValues(
        Promise.resolve({ isConfirmed: true }) as any,
        Promise.resolve() as any
      );
      teamApiSpy.deleteTeam.and.returnValue(of({}));

      component.deleteTeam(1);
      tick();

      expect(teamApiSpy.deleteTeam).toHaveBeenCalledWith(1);
    }));

    it('should not delete team when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);

      component.deleteTeam(1);
      tick();

      expect(teamApiSpy.deleteTeam).not.toHaveBeenCalled();
    }));

    it('should show error when delete fails', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValues(
        Promise.resolve({ isConfirmed: true }) as any,
        Promise.resolve() as any
      );
      spyOn(console, 'error');
      teamApiSpy.deleteTeam.and.returnValue(throwError(() => ({ error: { message: 'No se puede eliminar' } })));

      component.deleteTeam(1);
      tick();

      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('clear', () => {
    it('should clear filter', () => {
      component.filter = 'some text';
      component.clear();
      expect(component.filter).toBe('');
    });
  });

  describe('openModal', () => {
    it('should open modal with template', () => {
      const template = {} as any;
      component.openModal(template);
      expect(modalSpy.open).toHaveBeenCalledWith(template, { size: 'lg', centered: true });
    });
  });

  describe('closeModal', () => {
    it('should dismiss all modals', () => {
      component.closeModal();
      expect(modalSpy.dismissAll).toHaveBeenCalled();
    });

    it('should reset form', () => {
      component.teamForm.patchValue({ nameTeam: 'Test', phone: '123', status: true });
      component.closeModal();
      expect(component.teamForm.value.nameTeam).toBeFalsy();
    });

    it('should reset idTeam to null', () => {
      component.idTeam = 5;
      component.closeModal();
      expect(component.idTeam).toBeNull();
    });
  });

  describe('estados', () => {
    it('should have predefined status options', () => {
      expect(component.estados.length).toBe(2);
      expect(component.estados[0]).toEqual({ valor: true, etiqueta: 'Activo' });
      expect(component.estados[1]).toEqual({ valor: false, etiqueta: 'Inactivo' });
    });
  });
});

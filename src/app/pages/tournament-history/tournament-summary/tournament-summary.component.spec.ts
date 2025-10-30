import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentSummaryComponent } from './tournament-summary.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { TournamentsService } from 'src/app/services/tournaments.service';

describe('TournamentSummaryComponent', () => {
  let component: TournamentSummaryComponent;
  let fixture: ComponentFixture<TournamentSummaryComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentSummaryComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1' // Simula el ID desde la ruta
              }
            }
          }
        },
        {
          provide: TournamentsService,
          useValue: jasmine.createSpyObj('TournamentsService', ['getTournamentById'])
        },
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back'])
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Ignora <app-header> y otros componentes no declarados
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentSummaryComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournament successfully', () => {
    const mockResponse: any = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        categories: [{ name: 'Cat 1' }],
        modalities: [{ name: 'Mod 1' }],
        branches: [{ branchId: 1, name: 'Central' }],
        tournamentRegistrations: [{ playerId: 1, name: 'John', categoryId: 1 }],
      },
    };

    spyOn(service, 'getTournamentById').and.returnValue(of(mockResponse));

    component.loadTournamentById(1);

    expect(service.getTournamentById).toHaveBeenCalledWith(1);
    expect(component.selectedTournament).toEqual(mockResponse.data);
    expect(component.categories.length).toBe(1);
    expect(component.branches.length).toBe(1);
    expect(component.players.length).toBe(1);
  });

  it('should handle error when loading tournament', () => {
    const consoleSpy = spyOn(console, 'error');
    const swalSpy = spyOn(Swal, 'fire');

    spyOn(service, 'getTournamentById').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.loadTournamentById(1);

    expect(consoleSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo cargar el torneo',
      'error'
    );
  });

  it('should navigate back when goBack() is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should count players by category', () => {
    component.players = [
      { playerId: 1, categoryId: 1 } as any,
      { playerId: 2, categoryId: 2 } as any,
      { playerId: 3, categoryId: 1 } as any,
    ];

    const count = component.getPlayersCountByCategory(1);
    expect(count).toBe(2);
  });

  it('should load tournament and assign fallback branches', fakeAsync(() => {
    const mockResponse = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        name: 'Torneo Test',
        categories: [{ categoryId: 1, name: 'Cat A' }],
        modalities: [{ modalityId: 1, name: 'Mod A', status: true }],
        branches: [{
          branchId: 1,
          name: 'Branch A',
          description: 'Desc',
          status: true
        }],
        branchPlayerCounts: [], // <-- vacío para probar el fallback a "branches"
        tournamentRegistrations: [{
          registrationId: 1,
          tournamentId: 1,
          personId: 1,
          personFullName: 'Jugador 1',
          categoryId: 1,
          categoryName: 'Cat A',
          modalityId: 1,
          modalityName: 'Mod A',
          branchId: 1,
          branchName: 'Branch A',
          teamId: 1,
          teamName: 'Equipo 1',
          status: true,
          registrationDate: new Date(),
          createdBy: 'admin',
          updatedBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }
    };

    tournamentsServiceSpy.getTournamentById.and.returnValue(of(mockResponse));

    fixture.detectChanges();
    tick(); // Finalizar observable

    expect(component.selectedTournament?.name).toBe('Torneo Test');
    expect(component.categories.length).toBe(1);
    expect(component.modalities.length).toBe(1);
    expect(component.branches.length).toBe(1); // <-- fallback correcto
    expect(component.players.length).toBe(1);
  }));

  it('should show info alert if tournament not found', fakeAsync(() => {
    spyOn(Swal, 'fire');
    tournamentsServiceSpy.getTournamentById.and.returnValue(
      of({ success: true, message: '', data: null }) // ← ahora sí cumple con la interfaz
    );

    fixture.detectChanges();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Atención', 'No se encontró el torneo solicitado', 'info');
  }));

  it('should go back on goBack()', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});

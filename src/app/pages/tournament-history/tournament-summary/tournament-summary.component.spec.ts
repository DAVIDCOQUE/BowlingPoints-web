import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentSummaryComponent } from './tournament-summary.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { RouterTestingModule } from '@angular/router/testing'; // ✅ Importado para routerLink

describe('TournamentSummaryComponent', () => {
  let component: TournamentSummaryComponent;
  let fixture: ComponentFixture<TournamentSummaryComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentSummaryComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule // ✅ Requerido para usar routerLink en el template
      ],
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentSummaryComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
        branchPlayerCounts: [], // <-- vacío para fallback
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
    tick(); // Finaliza el observable

    expect(component.selectedTournament?.name).toBe('Torneo Test');
    expect(component.categories.length).toBe(1);
    expect(component.modalities.length).toBe(1);
    expect(component.branches.length).toBe(1); // <- fallback aplicado
    expect(component.players.length).toBe(1);
  }));

  it('should show info alert if tournament not found', fakeAsync(() => {
    spyOn(Swal, 'fire');
    tournamentsServiceSpy.getTournamentById.and.returnValue(
      of({ success: true, message: '', data: null })
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

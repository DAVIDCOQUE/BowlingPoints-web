import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentParticipantsComponent } from './tournament-participants.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TournamentsService } from 'src/app/services/tournaments.service';
import Swal from 'sweetalert2';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ITournament } from 'src/app/model/tournament.interface';

interface IGenerico<T> {
  success: boolean;
  message: string;
  data: T;
}

describe('TournamentParticipantsComponent', () => {
  let component: TournamentParticipantsComponent;
  let fixture: ComponentFixture<TournamentParticipantsComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;

  beforeEach(async () => {
    const mockRoute = {
      snapshot: {
        paramMap: {
          get: () => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [TournamentParticipantsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        {
          provide: TournamentsService,
          useValue: jasmine.createSpyObj('TournamentsService', ['getTournamentById'])
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentParticipantsComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournament and build cards', fakeAsync(() => {
    const mockResponse: IGenerico<ITournament> = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        name: 'Torneo Test',
        categories: [{ categoryId: 1, name: 'Cat A' }],
        modalities: [{
          modalityId: 1,
          name: 'Mod A',
          status: true
        }],
        branches: [{
          branchId: 1,
          name: 'Branch A',
          description: 'Descripción de prueba',
          status: true
        }],
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
    tick();

    expect(component.selectedTournament).toEqual(mockResponse.data);
    expect(component.categories.length).toBe(1);
    expect(component.modalities.length).toBe(1);
    expect(component.branches.length).toBe(1);
    expect(component.players.length).toBe(1);
    expect(component.cards.length).toBe(3);

    expect(component.cards[0].title).toBe('Modalidades');
    expect(component.cards[1].title).toBe('Categorías');
    expect(component.cards[2].title).toBe('Ramas');
  }));

  it('should show info alert if tournament not found', fakeAsync(() => {
    spyOn(Swal, 'fire');

    tournamentsServiceSpy.getTournamentById.and.returnValue(
      of({ success: true, message: '', data: null } as IGenerico<ITournament | null>)
    );

    fixture.detectChanges();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Atención', 'No se encontró el torneo solicitado', 'info');
  }));
});

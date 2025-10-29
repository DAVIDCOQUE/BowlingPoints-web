import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import Swal from 'sweetalert2';
import { TournamentParticipantsComponent } from './tournament-participants.component';
import { environment } from 'src/environments/environment';
import { ITournament } from 'src/app/model/tournament.interface';
import { IUser } from 'src/app/model/user.interface';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TournamentsService } from 'src/app/services/tournaments.service';

describe('TournamentParticipantsComponent', () => {
  let component: TournamentParticipantsComponent;
  let fixture: ComponentFixture<TournamentParticipantsComponent>;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockTournament: ITournament = {
    tournamentId: 1,
    name: 'Torneo de Prueba',
    ambitName: { ambitId: 1, name: 'Nacional' },
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-01-02'),
    status: true,
    location: 'Estadio Central',
    imageUrl: 'test.jpg',
    organizer: 'Organizador',
    stage: 'Final',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
    categories: [],
    modalities: [],
    tournamentRegistrations: [],
    branches: [],
    teams: [],
  };

  const mockPlayers: IUser[] = [
    {
      userId: 1,
      nickname: 'Player1',
      password: 'dummy',
      categories: [],
      roles: [],
      personId: 1,
      document: '123',
      fullName: 'Jugador Uno',
      fullSurname: 'Apellido',
      email: 'jugador@uno.com',
      phone: '999999',
      gender: 'M',
      birthDate: new Date('1990-01-01'),
      clubId: 1,
      club: { clubId: 1, name: 'Club de Prueba', city: 'Cali' } as any,
      roleInClub: 'Miembro',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      sub: '1',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TournamentParticipantsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentParticipantsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${apiUrl}/tournaments/1`);
    req1.flush({ success: true, data: mockTournament });
    const req2 = httpMock.expectOne(`${apiUrl}/tournaments/1/players`);
    req2.flush({ success: true, data: mockPlayers });

    expect(component).toBeTruthy();
  });

  it('should load tournament successfully', () => {
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${apiUrl}/tournaments/1`);
    req1.flush({ success: true, data: mockTournament });
    const req2 = httpMock.expectOne(`${apiUrl}/tournaments/1/players`);
    req2.flush({ success: true, data: mockPlayers });

    expect(component.selectedTournament).toEqual(mockTournament);
    expect(component.cards.length).toBe(3);
  });

  it('should show error alert when loadTournament fails', () => {
    const swalSpy = spyOn(Swal, 'fire');
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${apiUrl}/tournaments/1`);
    req1.flush('Error', { status: 500, statusText: 'Server Error' });

    // 💡 Cierra la request que se dispara después del fallo
    const pending = httpMock.match(`${apiUrl}/tournaments/1/players`);
    for (const req of pending) {
      req.flush({});
    }

    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo cargar la información del torneo',
      'error'
    );
  });

  it('should load players successfully', () => {
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${apiUrl}/tournaments/1`);
    req1.flush({ success: true, data: mockTournament });
    const req2 = httpMock.expectOne(`${apiUrl}/tournaments/1/players`);
    req2.flush({ success: true, data: mockPlayers });

    expect(component.players.length).toBe(1);
    expect(component.players[0].personFullName).toBe('Jugador Uno');
  });

  it('should show alert when loadPlayers fails', () => {
    const swalSpy = spyOn(Swal, 'fire');
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${apiUrl}/tournaments/1`);
    req1.flush({ success: true, data: mockTournament });
    const req2 = httpMock.expectOne(`${apiUrl}/tournaments/1/players`);
    req2.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los jugadores inscritos',
      'error'
    );
  });

  it('should build cards correctly in updateCards', () => {
    component.modalities = [
      { modalityId: 1, name: 'Individual', description: '', status: true },
    ];
    component.categories = [
      { categoryId: 1, name: 'A', description: '', status: true },
    ];

    (component as any).buildCards();

    expect(component.cards.length).toBe(3);
    expect(component.cards[0].title).toBe('Modalidades');
    expect(component.cards[1].title).toBe('Categorías');
    expect(component.cards[2].title).toBe('Ramas');
  });

  it('should replace image src on error', () => {
    const img = new Image();
    const event = { target: img } as unknown as Event;
    component.onImgError(event, 'fallback.jpg');
    expect(img.src).toContain('fallback.jpg');
  });

  it('should not call loadTournamentById if tournamentId is null', () => {
    const routeMock = {
      snapshot: {
        paramMap: new Map(), // simulamos que no hay parámetro
      },
    };

    TestBed.overrideProvider(ActivatedRoute, { useValue: routeMock });
    const fixture = TestBed.createComponent(TournamentParticipantsComponent);
    const component = fixture.componentInstance;

    const loadSpy = spyOn(component, 'loadTournamentById');
    component.ngOnInit();

    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('should load tournament data successfully', () => {
    const mockTournament = {
      data: {
        categories: [{ id: 1 }],
        modalities: [{ id: 1 }],
        branches: [{ id: 1 }],
        tournamentRegistrations: [{ id: 1 }],
      },
    };

    const serviceSpy = jasmine.createSpyObj('TournamentsService', [
      'getTournamentById',
    ]);
    serviceSpy.getTournamentById.and.returnValue(of(mockTournament));

    TestBed.overrideProvider(TournamentsService, { useValue: serviceSpy });
    fixture = TestBed.createComponent(TournamentParticipantsComponent);
    component = fixture.componentInstance;

    const buildSpy = spyOn<any>(
      component as any,
      'buildCards'
    ).and.callThrough();
    component.loadTournamentById(5);

    expect(serviceSpy.getTournamentById).toHaveBeenCalledWith(5);
    expect(component.selectedTournament as any).toEqual(mockTournament.data);
    expect(buildSpy).toHaveBeenCalled();
  });

  it('should handle error when loadTournamentById fails', () => {
    const serviceSpy = jasmine.createSpyObj('TournamentsService', [
      'getTournamentById',
    ]);
    serviceSpy.getTournamentById.and.returnValue(
      throwError(() => new Error('Error'))
    );

    const swalSpy = spyOn(Swal, 'fire');
    component.loadTournamentById(5);

    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo cargar el torneo',
      'error'
    );
  });
});

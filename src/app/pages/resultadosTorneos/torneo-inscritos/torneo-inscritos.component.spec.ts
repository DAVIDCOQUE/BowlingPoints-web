import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import Swal from 'sweetalert2';
import { TorneoInscritosComponent } from './torneo-inscritos.component';
import { environment } from 'src/environments/environment';
import { ITournament } from 'src/app/model/tournament.interface';
import { IUser } from 'src/app/model/user.interface';

describe('TorneoInscritosComponent', () => {
  let component: TorneoInscritosComponent;
  let fixture: ComponentFixture<TorneoInscritosComponent>;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockTournament: ITournament = {
    tournamentId: 1,
    name: 'Torneo de Prueba',
    organizer: 'Organizador',
    imageUrl: 'test.jpg',
    modalities: [],
    categories: [],
    modalityIds: [],
    categoryIds: [],
    lugar: 'Ciudad Prueba',
    startDate: '2020-01-01',
    endDate: '2020-01-02',
    ambitId: 1,
    ambitName: 'Nacional',
    location: 'Estadio Central',
    stage: 'Final',
    status: true
  };

  const mockPlayers: IUser[] = [
    {
      userId: 1,
      personId: 1,
      roleId: 1,
      clubId: 1,
      document: '123',
      nickname: 'player1',
      fullName: 'Jugador Uno',
      fullSurname: 'Apellido',
      email: 'jugador@uno.com',
      roleDescription: 'Jugador',
      phone: '999999',
      gender: 'M',
      category: '',
      modality: '',
      rama: '',
      team: ''
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TorneoInscritosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TorneoInscritosComponent);
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
    pending.forEach(req => req.flush({}));

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
    expect(component.players[0].nickname).toBe('player1');
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
      { modalityId: 1, name: 'Individual', description: '', status: true }
    ];
    component.categories = [
      { categoryId: 1, name: 'A', description: '', status: true }
    ];

    component.updateCards();

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
});

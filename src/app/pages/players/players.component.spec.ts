import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersComponent } from './players.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';


describe('PlayersComponent', () => {
  let component: PlayersComponent;
  let fixture: ComponentFixture<PlayersComponent>;
  let httpMock: HttpTestingController;

  const mockPlayers = [
    {
      userId: 1,
      fullName: 'Jugador 1',
      email: 'jugador1@test.com',
      photoUrl: 'url1.jpg'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayersComponent],
      imports: [HttpClientTestingModule, FormsModule ],
      providers: [
        {
          provide: AuthService,
          useValue: {}
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar jugadores correctamente desde la API', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/results/all-player-ranking`);
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, message: '', data: mockPlayers });

    expect(component.players.length).toBe(1);
    expect(component.players[0].fullName).toBe('Jugador 1');
  });

  it('debe manejar error si falla la API al cargar jugadores', () => {
    spyOn(Swal, 'fire');

    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/results/all-player-ranking`);
    req.error(new ErrorEvent('Error de red'));

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No se pudo cargar el ranking de jugadores',
      'error'
    );
  });

  it('debe limpiar el filtro de búsqueda con clear()', () => {
    component.filter = 'busqueda';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('debe reemplazar la imagen si ocurre un error', () => {
    const mockEvent = {
      target: {
        src: ''
      }
    } as unknown as Event;

    component.onImgError(mockEvent, 'ruta/por/defecto.png');

    expect((mockEvent.target as HTMLImageElement).src).toBe('ruta/por/defecto.png');
  });
});

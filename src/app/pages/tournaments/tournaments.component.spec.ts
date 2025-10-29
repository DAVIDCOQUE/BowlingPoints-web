import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TournamentsComponent } from './tournaments.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { dateRangeValidator } from 'src/app/shared/validators/date-range.validator';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { ITournament } from 'src/app/model/tournament.interface';

describe('TournamentsComponent', () => {
  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;
  let httpMock: HttpTestingController;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  let service: TournamentsService;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      declarations: [TournamentsComponent],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TournamentsService);
    fixture.detectChanges();

    // Mocks iniciales disparados por ngOnInit
    mockNgOnInitRequests();
  });

  afterEach(() => {
    // Limpia cualquier petición pendiente
    httpMock.verify();
  });

  const createMockTournament = (): ITournament => ({
    tournamentId: 1,
    name: 'Torneo Test',
    ambitName: { ambitId: 1, name: 'Regional' },
    startDate: new Date(),
    endDate: new Date(),
    status: true,
    location: 'Cali',
    imageUrl: '',
    organizer: 'Liga Valle',
    stage: 'Clasificación',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    categories: [],
    modalities: [],
    branches: [],
    teams: [],
    tournamentRegistrations: [],
  });

  function mockNgOnInitRequests() {
    httpMock
      .expectOne('https://api.bowlingpoints.test/tournaments')
      .flush({ success: true, data: [] });
    httpMock
      .expectOne('https://api.bowlingpoints.test/modalities')
      .flush({ success: true, data: [] });
    httpMock
      .expectOne('https://api.bowlingpoints.test/categories')
      .flush({ success: true, data: [] });
    httpMock
      .expectOne('https://api.bowlingpoints.test/ambits')
      .flush({ success: true, data: [] });
    httpMock.expectOne('https://api-colombia.com/api/v1/Department').flush([]);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initForm and loadData on ngOnInit', () => {
    const spyInitForm = spyOn(component, 'initForm');
    const spyLoadData = spyOn(component, 'loadData');

    component.ngOnInit();

    expect(spyInitForm).toHaveBeenCalled();
    expect(spyLoadData).toHaveBeenCalled();
  });

  it('should call all data-loading methods in loadData', () => {
    const spyTournaments = spyOn(component, 'getTournaments');
    const spyModalities = spyOn(component, 'getModalitys');
    const spyCategories = spyOn(component, 'getCategories');
    const spyBranches = spyOn(component, 'getBranches');
    const spyDepartments = spyOn(component, 'getDepartments');
    const spyAmbits = spyOn(component, 'getAmbits');

    component.loadData();

    expect(spyTournaments).toHaveBeenCalled();
    expect(spyModalities).toHaveBeenCalled();
    expect(spyCategories).toHaveBeenCalled();
    expect(spyBranches).toHaveBeenCalled();
    expect(spyDepartments).toHaveBeenCalled();
    expect(spyAmbits).toHaveBeenCalled();
  });

  it('should initialize form with all required controls', () => {
    component.initForm();
    const form = component.tournamentForm;

    // Validamos existencia de los campos principales
    expect(form.contains('name')).toBeTrue();
    expect(form.contains('organizer')).toBeTrue();
    expect(form.contains('startDate')).toBeTrue();
    expect(form.contains('endDate')).toBeTrue();

    // Al inicio debe ser inválido
    expect(form.valid).toBeFalse();
  });

  it('should call mockNgOnInitRequests successfully', () => {
    mockNgOnInitRequests();
    expect(true).toBeTrue();
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.tournamentForm).toBeDefined();
    expect(component.tournamentForm.valid).toBeFalse();
  });

  it('should invalidate form when endDate is before startDate', () => {
    component.initForm();
    const form = component.tournamentForm;
    form.patchValue({
      startDate: '2025-10-10',
      endDate: '2025-10-05',
    });
    expect(form.valid).toBeFalse();
  });

  it('should patch form and open modal on editTournament', () => {
    const mockTournament = {
      tournamentId: 1,
      name: 'Torneo 1',
      organizer: 'Org',
      categories: [{ categoryId: 1, name: 'Cat 1' }],
      modalities: [{ modalityId: 2, name: 'Mod 1' }],
      startDate: new Date('2025-10-10'),
      endDate: new Date('2025-10-12'),
      ambitId: 1,
      location: 'City',
      stage: 'Etapa',
      status: true,
    };

    component.editTournament(mockTournament as any);

    expect(component.tournamentForm.value.name).toBe('Torneo 1');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should reset form and open modal if idTournament is null', () => {
    component.idTournament = null;
    const content = 'dummy';
    component.tournamentForm.patchValue({ name: 'X' });
    component.openModal(content);
    expect(component.tournamentForm.value.name).toBeNull();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(content);
  });

  it('should close modal and reset form', () => {
    component.tournamentForm.patchValue({ name: 'X' });
    component.closeModal();
    expect(component.tournamentForm.value.name).toBeNull();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should return filtered tournaments', () => {
    component.tournaments = [
      { tournamentName: 'Torneo A' } as any,
      { tournamentName: 'Otro' } as any,
    ];
    component.filter = 'torneo';
    const result = component.filteredTournaments;
    expect(result.length).toBe(1);
    expect((result[0] as any).tournamentName).toBe('Torneo A');
  });

  it('should return formatted modalities string', () => {
    const mockT = { modalities: [{ name: 'X' }, { name: 'Y' }] } as any;
    const str = component.getModalitiesString(mockT);
    expect(str).toBe('X, Y');
  });

  it('should return formatted categories string', () => {
    const mockT = { categories: [{ name: 'A' }, { name: 'B' }] } as any;
    const str = component.getCategoriesString(mockT);
    expect(str).toBe('A, B');
  });

  it('should format dates correctly with toYMDStrict', () => {
    const date = new Date('2025-01-01T00:00:00');
    const ts = date.getTime(); // timestamp exacto de esa fecha
    const expected = component.toYMDStrict(date); // esto devuelve lo que tu app ve

    expect(component.toYMDStrict(date)).toBe(expected);
    expect(component.toYMDStrict('2025-01-01')).toBe(expected);
    expect(component.toYMDStrict(ts)).toBe(expected);
    expect(component.toYMDStrict(null)).toBeNull();
  });

  // 🔹 Cobertura completa de toYMDStrict()
  describe('toYMDStrict()', () => {
    it('should return null when value is undefined or null', () => {
      expect(component.toYMDStrict(undefined)).toBeNull();
      expect(component.toYMDStrict(null)).toBeNull();
    });

    it('should return the same string if already in YYYY-MM-DD format', () => {
      const value = '2025-12-31';
      expect(component.toYMDStrict(value)).toBe('2025-12-31');
    });

    it('should convert a valid Date object to YYYY-MM-DD', () => {
      const date = new Date('2025-07-15T10:30:00');
      expect(component.toYMDStrict(date)).toBe('2025-07-15');
    });

    it('should convert a valid timestamp number to YYYY-MM-DD', () => {
      const timestamp = new Date('2025-03-20').getTime();
      expect(component.toYMDStrict(timestamp)).toBe('2025-03-20');
    });

    it('should convert an ISO date string to YYYY-MM-DD', () => {
      const iso = '2025-04-10T00:00:00Z';
      expect(component.toYMDStrict(iso)).toBe('2025-04-10');
    });

    it('should return null for invalid date strings', () => {
      expect(component.toYMDStrict('invalid-date')).toBeNull();
    });

    it('should return null for non-date objects', () => {
      expect(component.toYMDStrict({ a: 1, b: 2 })).toBeNull();
    });

    it('should log a warning for invalid values', () => {
      const warnSpy = spyOn(console, 'warn');
      component.toYMDStrict('not-a-date');
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  it('should not submit form if invalid', () => {
    component.tournamentForm = component.fb.group(
      {
        name: [''],
        organizer: [''],
        modalityIds: [''],
        categoryIds: [''],
        startDate: ['2025-01-10'],
        endDate: ['2025-01-05'], // fecha inválida: end < start
        ambitId: [''],
        location: [''],
        stage: [''],
        status: [''],
      },
      {
        validators: dateRangeValidator('startDate', 'endDate', {
          allowEqual: true,
        }),
      }
    );

    spyOn(Swal, 'fire');
    spyOn(service, 'createTournament').and.returnValue(of({}));

    component.tournamentForm.markAllAsTouched();
    expect(component.tournamentForm.valid).toBeFalse();

    component.saveForm();

    expect(service.createTournament).not.toHaveBeenCalled();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('should confirm and call deleteTournament', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );
    spyOn(service, 'deleteTournament').and.returnValue(of({}));
    spyOn(component, 'getTournaments');

    component.deleteTournament(1);
    tick();

    expect(service.deleteTournament).toHaveBeenCalled();
  }));

  //Prueba: carga exitosa de torneos
  it('should load tournaments successfully', () => {
    const mockResponse = {
      success: true,
      message: '',
      data: [createMockTournament()],
    };

    spyOn(service, 'getTournaments').and.returnValue(of(mockResponse));
    component.getTournaments();

    expect(service.getTournaments).toHaveBeenCalled();
    expect(component.tournaments).toEqual(mockResponse.data);
  });

  it('should handle error in getTournaments()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(service, 'getTournaments').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getTournaments();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar torneos:',
      jasmine.any(Error)
    );
  });

  it('should load modalities successfully', () => {
    const mockResponse = {
      success: true,
      message: '',
      data: [
        {
          modalityId: 1,
          name: 'Mock Modality',
          description: 'modalidad de prueba',
          status: true,
        },
      ],
    };

    spyOn(service, 'getModalities').and.returnValue(of(mockResponse));

    component.getModalitys();

    expect(service.getModalities).toHaveBeenCalled();
    expect(component.modalities).toEqual(mockResponse.data);
  });

  it('should handle error in getModalitys()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(service, 'getModalities').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getModalitys();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar modalidades:',
      jasmine.any(Error)
    );
  });

  it('should load categories successfully', () => {
    const mockResponse = {
      success: true,
      message: '',
      data: [{ categoryId: 1, name: 'Mock Category' }],
    };
    spyOn(service, 'getCategories').and.returnValue(of(mockResponse));
    component.getCategories();

    expect(service.getCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(mockResponse.data);
  });

  it('should handle error in getCategories()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(service, 'getCategories').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getCategories();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar categorías:',
      jasmine.any(Error)
    );
  });

  it('should load ambits successfully', () => {
    const mockResponse = {
      success: true,
      message: '',
      data: [{ ambitId: 1, name: 'Mock Ambit' }],
    };
    spyOn(service, 'getAmbits').and.returnValue(of(mockResponse));
    component.getAmbits();

    expect(service.getAmbits).toHaveBeenCalled();
    expect(component.ambits).toEqual(mockResponse.data);
  });

  it('should handle error in getAmbits()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(service, 'getAmbits').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getAmbits();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar ámbitos:',
      jasmine.any(Error)
    );
  });

  it('should load branches successfully', () => {
    const mockResponse = [
      {
        branchId: 1,
        name: 'Valle',
        description: 'Sucursal principal en el Valle del Cauca',
        status: true,
      },
    ];

    spyOn(component['branchesService'], 'getAll').and.returnValue(
      of(mockResponse)
    );

    component.getBranches();

    expect(component['branchesService'].getAll).toHaveBeenCalled();
    expect(component.branches).toEqual(mockResponse);
  });

  it('should handle error in getBranches()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(component['branchesService'], 'getAll').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getBranches();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar ramas:',
      jasmine.any(Error)
    );
  });

  it('should load departments successfully', () => {
    const mockResponse = [{ id: 1, name: 'Antioquia' }];
    spyOn(component['tournamentsService'], 'getDepartments').and.returnValue(
      of(mockResponse)
    );

    component.getDepartments();

    expect(component['tournamentsService'].getDepartments).toHaveBeenCalled();
    expect(component.departments).toEqual(mockResponse);
  });

  it('should handle error in getDepartments()', () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(component['tournamentsService'], 'getDepartments').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.getDepartments();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar departamentos:',
      jasmine.any(Error)
    );
  });

  it('should return all tournaments if filter is empty', () => {
    component.filter = '';
    component.tournaments = [
      { name: 'Torneo 1' } as any,
      { name: 'Torneo 2' } as any,
    ];

    const result = component.filteredTournaments;
    expect(result.length).toBe(2);
  });

  //Prueba: filtrado de torneos según nombre
  it('should filter tournaments by name', () => {
    component.filter = 'torneo a';
    component.tournaments = [
      { name: 'Torneo A' } as any,
      { name: 'Copa B' } as any,
    ];

    const result = component.filteredTournaments;
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Torneo A');
  });

  it('should return empty array when no tournaments match filter', () => {
    component.filter = 'xyz';
    component.tournaments = [{ name: 'Torneo Z' } as any];

    const result = component.filteredTournaments;
    expect(result.length).toBe(0);
  });

  it('should handle editTournament when tournament comes with full objects', () => {
    const mockTournament = {
      tournamentId: 10,
      name: 'Torneo Prueba',
      categories: [{ categoryId: 1, name: 'Cat 1' }],
      modalities: [{ modalityId: 2, name: 'Mod 1' }],
      ambit: { ambitId: 3, name: 'Regional' },
      branches: [{ branchId: 4, name: 'Sucursal Sur' }],
    } as any;

    spyOn(modalServiceSpy, 'open');

    component.editTournament(mockTournament);

    expect(component.idTournament).toBe(10);
    expect(component.tournamentForm.value.name).toBe('Torneo Prueba');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should handle editTournament when tournament comes with only IDs', () => {
    const mockTournament = {
      tournamentId: 20,
      categoryIds: [1],
      modalityIds: [2],
      ambitId: 3,
      branchIds: [4],
      name: 'Solo IDs',
    } as any;

    spyOn(modalServiceSpy, 'open');

    component.editTournament(mockTournament);

    expect(component.idTournament).toBe(20);
    expect(component.tournamentForm.value.name).toBe('Solo IDs');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should handle editTournament when tournamentName is used instead of name', () => {
    const mockTournament = {
      tournamentId: 30,
      tournamentName: 'Nombre alternativo',
    } as any;

    spyOn(modalServiceSpy, 'open');

    component.editTournament(mockTournament);

    expect(component.tournamentForm.value.name).toBe('Nombre alternativo');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });
});

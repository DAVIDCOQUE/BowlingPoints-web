import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TorneoInscritosComponent } from './torneo-inscritos.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { of } from 'rxjs';
import { IUser } from 'src/app/model/user.interface';

describe('TorneoInscritosComponent', () => {
  let component: TorneoInscritosComponent;
  let fixture: ComponentFixture<TorneoInscritosComponent>;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Crear mock del AuthService
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', ['fetchUser']);
    mockAuthService.fetchUser.and.returnValue(of({ clubId: 1 } as IUser));

    // Asignar user$ como getter manual
    Object.defineProperty(mockAuthService, 'user$', {
      get: () => of({ clubId: 1 } as IUser)
    });

    await TestBed.configureTestingModule({
      declarations: [TorneoInscritosComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        NgbModalModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TorneoInscritosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    // Flushear llamadas del ngOnInit()
    httpMock.expectOne(`${component.apiUrl}/clubs/1/details`).flush({
      clubId: 1,
      name: 'Mi Club',
      members: []
    });

    httpMock.expectOne(`${component.apiUrl}/users`).flush({
      success: true,
      message: '',
      data: []
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario correctamente', () => {
    expect(component.clubForm).toBeDefined();
    expect(component.clubForm.get('name')).toBeTruthy();
    expect(component.clubForm.get('status')?.value).toBe(true);
  });

  it('debería devolver false si NO hay miembros duplicados', () => {
    const result = (component as any).hasDuplicateMembers([
      { personId: 1 },
      { personId: 2 }
    ]);
    expect(result).toBeFalse();
  });

  it('debería devolver true si hay miembros duplicados', () => {
    const result = (component as any).hasDuplicateMembers([
      { personId: 1 },
      { personId: 1 }
    ]);
    expect(result).toBeTrue();
  });

  it('debería obtener el clubId desde AuthService.user$', () => {
    expect(component.clubId).toBe(1);
  });


  it('debería manejar error al cargar datos del club', () => {
    // Reinstanciar componente para forzar error
    fixture = TestBed.createComponent(TorneoInscritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const reqClub = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    reqClub.flush({}, { status: 500, statusText: 'Error' });

    const reqUsers = httpMock.expectOne(`${component.apiUrl}/users`);
    reqUsers.flush({ success: true, message: '', data: [] });

    expect(component.miClub).toBeNull();
  });

  it('debería manejar error al cargar usuarios', () => {
    fixture = TestBed.createComponent(TorneoInscritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne(`${component.apiUrl}/clubs/1/details`).flush({
      clubId: 1,
      name: 'Mi Club',
      members: []
    });

    const reqUsers = httpMock.expectOne(`${component.apiUrl}/users`);
    reqUsers.flush({}, { status: 500, statusText: 'Error' });

    // No podemos acceder directamente a usuariosLoaded (es private)
    // Pero podemos confirmar que no llenó usuarios:
    expect(component.usuarios.length).toBe(0);
  });
});

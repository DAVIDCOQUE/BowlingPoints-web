import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole', 'logout']);

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set roles in ngOnInit', () => {
    mockAuthService.hasRole.withArgs('ADMIN').and.returnValue(true);
    mockAuthService.hasRole.withArgs('JUGADOR').and.returnValue(false);
    mockAuthService.hasRole.withArgs('ENTRENADOR').and.returnValue(true);

    component.ngOnInit();

    expect(component.isAdmin).toBeTrue();
    expect(component.isJugador).toBeFalse();
    expect(component.isEntrenador).toBeTrue();
  });

  it('should set isShowing to true on mouseenter if not expanded', () => {
    component.isExpanded = false;
    component.mouseenter();
    expect(component.isShowing).toBeTrue();
  });

  it('should NOT set isShowing to true on mouseenter if expanded', () => {
    component.isExpanded = true;
    component.mouseenter();
    expect(component.isShowing).toBeFalse();
  });

  it('should set isShowing to false on mouseleave if not expanded', () => {
    component.isExpanded = false;
    component.isShowing = true;
    component.mouseleave();
    expect(component.isShowing).toBeFalse();
  });

  it('should NOT change isShowing on mouseleave if expanded', () => {
    component.isExpanded = true;
    component.isShowing = true;
    component.mouseleave();
    expect(component.isShowing).toBeTrue();
  });

  it('should toggle showSubmenu', () => {
    component.showSubmenu = false;
    component.toggleSubmenu();
    expect(component.showSubmenu).toBeTrue();
    component.toggleSubmenu();
    expect(component.showSubmenu).toBeFalse();
  });

  it('should call logout and navigate to login', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbitComponent } from './ambit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAmbit } from 'src/app/model/ambit.interface';
import { TemplateRef } from '@angular/core';
import { AmbitApiService } from 'src/app/services/ambit-api.service';
import { of } from 'rxjs';

describe('AmbitComponent', () => {
  let component: AmbitComponent;
  let fixture: ComponentFixture<AmbitComponent>;
  let ambitService: jasmine.SpyObj<AmbitApiService>;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  beforeEach(async () => {
    // Crear spy para el servicio
    const ambitServiceSpy = jasmine.createSpyObj('AmbitApiService', ['getAmbits', 'create', 'update', 'delete']);

    await TestBed.configureTestingModule({
      declarations: [AmbitComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AmbitApiService, useValue: ambitServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbitComponent);
    component = fixture.componentInstance;
    ambitService = TestBed.inject(AmbitApiService) as jasmine.SpyObj<AmbitApiService>;

    // Configurar respuesta por defecto
    ambitService.getAmbits.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form invalid', () => {
    expect(component.ambitForm.valid).toBeFalse();
  });

  it('should get ambits from API', () => {
    const mockAmbits: IAmbit[] = [
      { ambitId: 1, name: 'Nacional', description: 'Ámbito nacional', status: true }
    ];

    ambitService.getAmbits.and.returnValue(of(mockAmbits));
    component.getAmbits();

    expect(ambitService.getAmbits).toHaveBeenCalled();
    expect(component.ambits.length).toBe(1);
  });

  it('should open modal and patch form when editing', () => {
    const ambit: IAmbit = {
      ambitId: 1,
      name: 'Test Ambit',
      description: 'Descripción',
      status: true
    };

    spyOn(component, 'openModal');
    component.editAmbit(ambit);

    expect(component.ambitForm.value.name).toBe('Test Ambit');
    expect(component.openModal).toHaveBeenCalled();
  });

  it('should reset form and open modal when creating new', () => {
    component.idAmbit = null;
    component.ambitForm.patchValue({ name: 'Test', status: true });
    component.openModal({} as TemplateRef<any>);

    expect(component.ambitForm.value.name).toBeNull();
  });

  it('should close modal and reset form', () => {
    component.closeModal();
    expect(modalServiceMock.dismissAll).toHaveBeenCalled();
    expect(component.idAmbit).toBeNull();
  });

  it('should clear filter', () => {
    component.filter = 'algo';
    component.clear();
    expect(component.filter).toBe('');
  });
});

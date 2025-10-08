import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbitComponent } from './ambit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAmbit } from 'src/app/model/ambit.interface';
import { TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';

describe('AmbitComponent', () => {
  let component: AmbitComponent;
  let fixture: ComponentFixture<AmbitComponent>;
  let httpMock: HttpTestingController;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmbitComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbitComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/ambits`);
    req.flush({ success: true, message: '', data: [] });
  });

  afterEach(() => {
    httpMock.verify();
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

    component.getAmbits();

    const req = httpMock.expectOne(`${environment.apiUrl}/ambits`);
    req.flush({ success: true, message: '', data: mockAmbits });

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

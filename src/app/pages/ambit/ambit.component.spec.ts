import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbitComponent } from './ambit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { IAmbit } from 'src/app/model/ambit.interface';
import { AmbitApiService } from 'src/app/services/ambit-api.service';
import Swal from 'sweetalert2';

describe('AmbitComponent', () => {
  let component: AmbitComponent;
  let fixture: ComponentFixture<AmbitComponent>;
  let ambitService: jasmine.SpyObj<AmbitApiService>;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  beforeEach(async () => {
    const ambitServiceSpy = jasmine.createSpyObj('AmbitApiService', [
      'getAmbits', 'createAmbit', 'updateAmbit', 'deleteAmbit'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AmbitComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule, // necesario por [(ngModel)] en el HTML
        HttpClientTestingModule
      ],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AmbitApiService, useValue: ambitServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbitComponent);
    component = fixture.componentInstance;
    ambitService = TestBed.inject(AmbitApiService) as jasmine.SpyObj<AmbitApiService>;

    // Mocks por defecto
    ambitService.getAmbits.and.returnValue(of([]));

    // Mock de SweetAlert
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
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
    component.openModal({} as any);
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

  it('should mark form as touched if invalid and not submit', () => {
    component.ambitForm.patchValue({ name: '', status: null });
    spyOn(component.ambitForm, 'markAllAsTouched');
    component.saveForm();
    expect(component.ambitForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should create ambit via service', () => {
    const payload = { name: 'New Ambit', status: true, description: '' };
    component.ambitForm.patchValue(payload);
    ambitService.createAmbit.and.returnValue(of({}));

    component.saveForm();

    expect(ambitService.createAmbit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'New Ambit',
        status: true
      })
    );
  });

  it('should update ambit via service', () => {
    const payload = { name: 'Updated Ambit', status: true, description: '' };
    component.idAmbit = 1;
    component.ambitForm.patchValue(payload);
    ambitService.updateAmbit.and.returnValue(of({}));

    component.saveForm();

    expect(ambitService.updateAmbit).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        name: 'Updated Ambit',
        status: true
      })
    );
  });

  it('should delete ambit if confirmed', async () => {
    ambitService.deleteAmbit.and.returnValue(of({}));
    await component.deleteAmbit(1);
    expect(ambitService.deleteAmbit).toHaveBeenCalledWith(1);
  });

  it('should not delete ambit if user cancels', async () => {
    (Swal.fire as jasmine.Spy).and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    await component.deleteAmbit(2);
    expect(ambitService.deleteAmbit).not.toHaveBeenCalled();
  });
});

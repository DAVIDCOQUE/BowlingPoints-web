import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AmbitComponent } from './ambit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { IAmbit } from 'src/app/model/ambit.interface';
import { AmbitApiService } from 'src/app/services/ambit-api.service';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AmbitComponent', () => {
  let component: AmbitComponent;
  let fixture: ComponentFixture<AmbitComponent>;
  let ambitService: jasmine.SpyObj<AmbitApiService>;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll'),
  };

  function fillValidForm(cmp: AmbitComponent, name = 'Ambit X', status = true, description = 'desc') {
    cmp.ambitForm.setValue({ name, status, description });
  }

  beforeEach(async () => {
    const ambitServiceSpy = jasmine.createSpyObj('AmbitApiService', [
      'getAmbits',
      'createAmbit',
      'updateAmbit',
      'deleteAmbit',
    ]);

    await TestBed.configureTestingModule({
      declarations: [AmbitComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AmbitApiService, useValue: ambitServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbitComponent);
    component = fixture.componentInstance;
    ambitService = TestBed.inject(AmbitApiService) as jasmine.SpyObj<AmbitApiService>;

    ambitService.getAmbits.and.returnValue(of([]));

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
      { ambitId: 1, name: 'Nacional', description: 'Ámbito nacional', status: true },
    ];
    ambitService.getAmbits.and.returnValue(of(mockAmbits));
    component.getAmbits();

    expect(ambitService.getAmbits).toHaveBeenCalled();
    expect(component.ambits.length).toBe(1);
  });

  it('should clear filter', () => {
    component.filter = 'algo';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should mark form as touched if invalid and not submit', () => {
    component.ambitForm.patchValue({ name: '', status: null });
    const markSpy = spyOn(component.ambitForm, 'markAllAsTouched');
    component.saveForm();

    expect(markSpy).toHaveBeenCalled();
    expect(ambitService.createAmbit).not.toHaveBeenCalled();
    expect(ambitService.updateAmbit).not.toHaveBeenCalled();
  });

  it('should create ambit via service', () => {
    const payload = { name: 'New Ambit', status: true, description: '' };
    const getSpy = spyOn(component, 'getAmbits');
    const closeSpy = spyOn(component, 'closeModal');
    (Swal.fire as jasmine.Spy).calls?.reset?.();

    component.idAmbit = null;
    component.ambitForm.patchValue(payload);
    ambitService.createAmbit.and.returnValue(of({}));

    component.saveForm();

    expect(ambitService.createAmbit).toHaveBeenCalledWith(
      jasmine.objectContaining(payload)
    );
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args).toEqual([
      'Éxito',
      jasmine.any(String),
      'success',
    ]);
    expect(getSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should update ambit via service', () => {
    const payload = { name: 'Updated Ambit', status: true, description: '' };
    const getSpy = spyOn(component, 'getAmbits');
    const closeSpy = spyOn(component, 'closeModal');
    (Swal.fire as jasmine.Spy).calls?.reset?.();

    component.idAmbit = 1;
    component.ambitForm.patchValue(payload);
    ambitService.updateAmbit.and.returnValue(of({}));

    component.saveForm();

    expect(ambitService.updateAmbit).toHaveBeenCalledWith(1, jasmine.objectContaining(payload));
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args).toEqual([
      'Éxito',
      jasmine.any(String),
      'success',
    ]);
    expect(getSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('ngOnInit: inicializa el form con validadores y llama a getAmbits', () => {
    expect(component.ambitForm).toBeDefined();
    expect(component.ambitForm.get('name')?.validator).toBeTruthy();
    expect(component.ambitForm.get('status')?.validator).toBeTruthy();
    expect(component.ambitForm.valid).toBeFalse();
    expect(ambitService.getAmbits).toHaveBeenCalled();
  });

  it('should reset form and open modal when creating new', () => {
    component.idAmbit = null;
    component.ambitForm.patchValue({ name: 'Test', status: true, description: 'x' });
    const resetSpy = spyOn(component.ambitForm, 'reset').and.callThrough();

    component.openModal({} as any);

    expect(component.ambitForm.get('name')!.value).toBeNull();
    expect(component.ambitForm.get('status')!.value).toBeNull();
    expect(component.ambitForm.get('description')!.value).toBeNull();
    expect(modalServiceMock.open).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('should close modal and reset form', () => {
    component.ambitForm.patchValue({ name: 'X', status: true, description: 'y' });
    component.closeModal();

    expect(modalServiceMock.dismissAll).toHaveBeenCalled();
    expect(component.idAmbit).toBeNull();
    expect(component.ambitForm.get('name')!.value).toBeNull();
    expect(component.ambitForm.get('status')!.value).toBeNull();
    expect(component.ambitForm.get('description')!.value).toBeNull();
  });

  it('should open modal and patch form when editing', () => {
    const ambit: IAmbit = {
      ambitId: 1,
      name: 'Test Ambit',
      description: 'Descripción',
      status: true,
    };

    spyOn(component as any, 'openModal');
    component.editAmbit(ambit);

    expect(component.idAmbit).toBe(1);
    expect(component.ambitForm.get('name')!.value).toBe('Test Ambit');
    expect(component.ambitForm.get('description')!.value).toBe('Descripción');
    expect(component.ambitForm.get('status')!.value).toBeTrue();
    expect((component as any).openModal).toHaveBeenCalled();
  });

  it('filteredAmbits: retorna todos si filter está vacío o con espacios', () => {
    component.ambits = [
      { ambitId: 1, name: 'Local' },
      { ambitId: 2, name: 'Regional' },
    ];

    component.filter = '';
    expect(component.filteredAmbits.length).toBe(2);

    component.filter = '   ';
    expect(component.filteredAmbits.length).toBe(2);
  });

  it('filteredAmbits: filtra por nombre ignorando mayúsculas/minúsculas', () => {
    component.ambits = [
      { ambitId: 1, name: 'Local' } as IAmbit,
      { ambitId: 2, name: 'Regional' } as IAmbit,
      { ambitId: 3, name: 'Internacional' } as IAmbit,
    ];

    component.filter = 'LOCAL';
    expect(component.filteredAmbits.map((a) => a.ambitId)).toEqual([1]);

    component.filter = 'nal';
    expect(component.filteredAmbits.map((a) => a.ambitId)).toEqual([2, 3]);
  });

  it('saveForm(): crea ambit → success + refresca + cierra modal', () => {
    fillValidForm(component, 'New Ambit', true, '');
    ambitService.createAmbit.and.returnValue(of({ ok: true }));

    const getSpy = spyOn(component, 'getAmbits');
    const closeSpy = spyOn(component, 'closeModal');
    (Swal.fire as jasmine.Spy).calls.reset();

    component.idAmbit = null;
    component.saveForm();

    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[1]).toMatch(/Ambito creado/i);
  });

  it('saveForm(): actualiza ambit → success + refresca + cierra modal', () => {
    fillValidForm(component, 'Updated Ambit', true, '');
    ambitService.updateAmbit.and.returnValue(of({ ok: true }));

    const getSpy = spyOn(component, 'getAmbits');
    const closeSpy = spyOn(component, 'closeModal');
    (Swal.fire as jasmine.Spy).calls.reset();

    component.idAmbit = 123;
    component.saveForm();

    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[1]).toMatch(/Ambito actualizado/i);
  });

  it('saveForm(): maneja error → console.error + Swal de error y NO refresca/cierra', () => {
    fillValidForm(component, 'Bad Ambit', true, '');
    const httpError = { error: { message: 'falló' } };
    ambitService.createAmbit.and.returnValue(throwError(() => httpError));

    const logSpy = spyOn(console, 'error');
    const getSpy = spyOn(component, 'getAmbits');
    const closeSpy = spyOn(component, 'closeModal');
    (Swal.fire as jasmine.Spy).calls.reset();

    component.idAmbit = null;
    component.saveForm();

    expect(logSpy).toHaveBeenCalledWith('Error al guardar Ambito:', httpError);
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[1]).toBe('falló');
    expect(getSpy).not.toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

it('deleteAmbit(): confirmado pero API falla → muestra error y NO refresca', fakeAsync(() => {
  (Swal.fire as jasmine.Spy).and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
  ambitService.deleteAmbit.and.returnValue(throwError(() => ({ status: 500 })));

  const getSpy = spyOn(component, 'getAmbits');

  component.deleteAmbit(7);
  tick();

  expect(ambitService.deleteAmbit).toHaveBeenCalledWith(7);

  const [title, message, icon] = (Swal.fire as jasmine.Spy).calls.mostRecent().args;

  expect(title).toBe('Error');
  expect(icon).toBe('error');

  const normalizedMsg = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  expect(normalizedMsg).toContain('No se pudo eliminar la Ambito');

  expect(getSpy).not.toHaveBeenCalled();
}));




  it('deleteAmbit(): cancelado → NO llama al servicio', fakeAsync(() => {
    (Swal.fire as jasmine.Spy).and.returnValue(Promise.resolve({ isConfirmed: false }) as any);

    component.deleteAmbit(5);
    tick();

    expect(ambitService.deleteAmbit).not.toHaveBeenCalled();
  }));

  it('openModal: con idAmbit definido NO resetea el formulario y abre el modal', () => {
    component.idAmbit = 99;
    component.ambitForm.patchValue({ name: 'Editando', status: true, description: 'x' });
    const resetSpy = spyOn(component.ambitForm, 'reset').and.callThrough();

    component.openModal({} as any);

    expect(resetSpy).not.toHaveBeenCalled();
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('closeModal: cierra modal, resetea formulario y limpia idAmbit', () => {
    component.idAmbit = 7;
    component.ambitForm.patchValue({ name: 'X', status: true, description: 'y' });

    const resetSpy = spyOn(component.ambitForm, 'reset').and.callThrough();
    component.closeModal();

    expect(modalServiceMock.dismissAll).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
    expect(component.idAmbit).toBeNull();
  });

  it('clear(): limpia el filtro aunque tenga sólo espacios', () => {
    component.filter = '   ';
    component.clear();
    expect(component.filter).toBe('');
  });
});

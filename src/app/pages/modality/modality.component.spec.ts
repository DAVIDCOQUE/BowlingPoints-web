import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalityComponent } from './modality.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IModality } from 'src/app/model/modality.interface';
import { TemplateRef } from '@angular/core';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { ModalityApiService } from 'src/app/services/modality-api.service';

describe('ModalityComponent', () => {
  let component: ModalityComponent;
  let fixture: ComponentFixture<ModalityComponent>;
  let modalityService: jasmine.SpyObj<ModalityApiService>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const modalityServiceSpy = jasmine.createSpyObj('ModalityApiService', ['getModalities', 'createModality', 'updateModality', 'deleteModality']);

    await TestBed.configureTestingModule({
      declarations: [ModalityComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: ModalityApiService, useValue: modalityServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalityComponent);
    component = fixture.componentInstance;
    modalityService = TestBed.inject(ModalityApiService) as jasmine.SpyObj<ModalityApiService>;

    // Configurar respuesta por defecto
    modalityService.getModalities.and.returnValue(of([]));
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(modalityService.getModalities).toHaveBeenCalled();
  });

  it('debe inicializar el formulario con valores vacíos', () => {
    fixture.detectChanges();

    expect(component.modalityForm).toBeTruthy();
    expect(component.modalityForm.get('name')?.value).toBe('');
    expect(component.modalityForm.get('status')?.value).toBe('');
  });

  it('debe cargar las modalidades desde la API', () => {
    const mockModalities: IModality[] = [
      { modalityId: 1, name: 'Individual', description: '', status: true }
    ];

    modalityService.getModalities.and.returnValue(of(mockModalities));
    component.getModalitys();

    expect(modalityService.getModalities).toHaveBeenCalled();
    expect(component.modalitys.length).toBe(1);
    expect(component.modalitys[0].name).toBe('Individual');
  });

  it('debe filtrar correctamente las modalidades', () => {
    // No depende de ngOnInit ni de HTTP
    component.modalitys = [
      { modalityId: 1, name: 'Individual', description: '', status: true },
      { modalityId: 2, name: 'Doble', description: '', status: true }
    ];

    component.filter = 'ind';
    const result = component.filteredModalitys;
    expect(result.length).toBe(1);
    expect(result[0].name).toContain('Individual');
  });

  it('debe llenar el formulario para editar y abrir el modal', () => {
    fixture.detectChanges();

    const modality: IModality = {
      modalityId: 1,
      name: 'Parejas',
      description: 'Descripción',
      status: true
    };

    spyOn(component, 'openModal');
    component.editModality(modality);

    expect(component.modalityForm.get('name')?.value).toBe('Parejas');
    expect(component.openModal).toHaveBeenCalled();
  });

  it('debe no guardar si el formulario es inválido', () => {
    fixture.detectChanges();

    component.modalityForm.patchValue({ name: '', status: '' });
    component.saveForm();

    expect(component.modalityForm.invalid).toBeTrue();
    expect(modalityService.createModality).not.toHaveBeenCalled();
    expect(modalityService.updateModality).not.toHaveBeenCalled();
  });

  it('debe crear una nueva modalidad', () => {
    fixture.detectChanges();

    component.modalityForm.setValue({
      name: 'Nuevo',
      description: '',
      status: true
    });

    component.idModality = null;
    modalityService.createModality.and.returnValue(of({}));
    component.saveForm();

    expect(modalityService.createModality).toHaveBeenCalled();
    expect(component.idModality).toBeNull();
  });

  it('debe actualizar una modalidad existente', () => {
    fixture.detectChanges();

    component.modalityForm.setValue({
      name: 'Actualizado',
      description: '',
      status: true
    });

    component.idModality = 5;
    modalityService.updateModality.and.returnValue(of({}));
    component.saveForm();

    expect(modalityService.updateModality).toHaveBeenCalledWith(5, jasmine.any(Object));
    expect(component.idModality).toBeNull();
  });


  it('debe eliminar una modalidad tras confirmación', async () => {
    fixture.detectChanges();

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    modalityService.deleteModality.and.returnValue(of({}));

    component.deleteModality(1);

    await Promise.resolve(); // Esperar al .then()

    expect(modalityService.deleteModality).toHaveBeenCalledWith(1);
  });

  it('debe abrir el modal y resetear el formulario si es nuevo', () => {
    fixture.detectChanges();

    component.idModality = null;
    component.modalityForm.patchValue({ name: 'ABC', status: true });
    component.openModal({} as TemplateRef<unknown>);

    expect(component.modalityForm.get('name')?.value).toBeNull();
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('debe cerrar el modal y resetear el formulario', () => {
    component.closeModal();
    expect(modalServiceMock.dismissAll).toHaveBeenCalled();
    expect(component.idModality).toBeNull();
  });

  it('debe limpiar el filtro', () => {
    component.filter = 'algo';
    component.clear();
    expect(component.filter).toBe('');
  });
});

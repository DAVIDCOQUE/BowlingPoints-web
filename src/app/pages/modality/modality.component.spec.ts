import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalityComponent } from './modality.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IModality } from 'src/app/model/modality.interface';
import { TemplateRef } from '@angular/core';
import Swal from 'sweetalert2';
import { of } from 'rxjs';

describe('ModalityComponent', () => {
  let component: ModalityComponent;
  let fixture: ComponentFixture<ModalityComponent>;
  let httpMock: HttpTestingController;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [ModalityComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalityComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no haya peticiones abiertas
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    req.flush({ success: true, message: '', data: [] });

    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con valores vacíos', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    req.flush({ success: true, message: '', data: [] });

    expect(component.modalityForm).toBeTruthy();
    expect(component.modalityForm.get('name')?.value).toBe('');
    expect(component.modalityForm.get('status')?.value).toBe('');
  });

  it('debe cargar las modalidades desde la API', () => {
    fixture.detectChanges();

    const mockModalities: IModality[] = [
      { modalityId: 1, name: 'Individual', description: '', status: true }
    ];

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: mockModalities });

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

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    req.flush({ success: true, message: '', data: [] });

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

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    req.flush({ success: true, message: '', data: [] });

    component.modalityForm.patchValue({ name: '', status: '' });
    component.saveForm();

    expect(component.modalityForm.invalid).toBeTrue();
  });

  it('debe crear una nueva modalidad', () => {
    fixture.detectChanges();

    // 1️⃣ GET en ngOnInit
    const getReq1 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq1.flush({ success: true, message: '', data: [] });

    component.modalityForm.setValue({
      name: 'Nuevo',
      description: '',
      status: true
    });

    component.idModality = null;
    component.saveForm();

    // 2️⃣ POST para crear modalidad
    const postReq = httpMock.expectOne(`${component.apiUrl}/modalities`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush({});

    // 3️⃣ GET posterior al POST (en el subscribe de saveForm)
    const getReq2 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq2.flush({ success: true, message: '', data: [] });

    expect(component.idModality).toBeNull();
  });

  it('debe actualizar una modalidad existente', () => {
    fixture.detectChanges();

    const getReq1 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq1.flush({ success: true, message: '', data: [] });

    component.modalityForm.setValue({
      name: 'Actualizado',
      description: '',
      status: true
    });

    component.idModality = 5;
    component.saveForm();

    const putReq = httpMock.expectOne(`${component.apiUrl}/modalities/5`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});

    const getReq2 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq2.flush({ success: true, message: '', data: [] });

    expect(component.idModality).toBeNull();
  });


  it('debe eliminar una modalidad tras confirmación', async () => {
    fixture.detectChanges();

    const getReq1 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq1.flush({ success: true, message: '', data: [] });

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);

    component.deleteModality(1);

    await Promise.resolve(); // Esperar al .then()

    const deleteReq = httpMock.expectOne(`${component.apiUrl}/modalities/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    const getReq2 = httpMock.expectOne(`${component.apiUrl}/modalities`);
    getReq2.flush({ success: true, message: '', data: [] });
  });

  it('debe abrir el modal y resetear el formulario si es nuevo', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/modalities`);
    req.flush({ success: true, message: '', data: [] });

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

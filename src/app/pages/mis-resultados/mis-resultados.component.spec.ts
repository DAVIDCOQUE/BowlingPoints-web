import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisResultadosComponent } from './mis-resultados.component';

describe('MisResultadosComponent', () => {
  let component: MisResultadosComponent;
  let fixture: ComponentFixture<MisResultadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MisResultadosComponent]
    });
    fixture = TestBed.createComponent(MisResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

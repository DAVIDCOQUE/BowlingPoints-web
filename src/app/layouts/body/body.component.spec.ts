import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

import { BodyComponent } from './body.component';

describe('BodyComponent', () => {
  let component: BodyComponent;
  let fixture: ComponentFixture<BodyComponent>;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;
  let breakpointSubject: Subject<BreakpointState>;

  beforeEach(async () => {
    breakpointSubject = new Subject<BreakpointState>();
    breakpointObserverSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']);
    breakpointObserverSpy.observe.and.returnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      declarations: [BodyComponent],
      providers: [
        { provide: BreakpointObserver, useValue: breakpointObserverSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BodyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial values', () => {
    expect(component.isSidebarExpanded).toBeTrue();
    expect(component.isMobile).toBeFalse();
  });

  it('should observe breakpoint on init', () => {
    fixture.detectChanges();
    expect(breakpointObserverSpy.observe).toHaveBeenCalledWith(['(max-width: 767px)']);
  });

  it('should set isMobile to true and collapse sidebar when breakpoint matches', () => {
    fixture.detectChanges();

    breakpointSubject.next({ matches: true, breakpoints: {} });

    expect(component.isMobile).toBeTrue();
    expect(component.isSidebarExpanded).toBeFalse();
  });

  it('should set isMobile to false and expand sidebar when breakpoint does not match', () => {
    fixture.detectChanges();

    breakpointSubject.next({ matches: false, breakpoints: {} });

    expect(component.isMobile).toBeFalse();
    expect(component.isSidebarExpanded).toBeTrue();
  });

  it('should toggle sidebar from expanded to collapsed', () => {
    component.isSidebarExpanded = true;
    component.toggleSidebar();
    expect(component.isSidebarExpanded).toBeFalse();
  });

  it('should toggle sidebar from collapsed to expanded', () => {
    component.isSidebarExpanded = false;
    component.toggleSidebar();
    expect(component.isSidebarExpanded).toBeTrue();
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    fixture.detectChanges();

    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});

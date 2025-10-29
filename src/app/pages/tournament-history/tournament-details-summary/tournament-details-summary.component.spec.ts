import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentDetailsSummaryComponent } from './tournament-details-summary.component';

describe('TournamentDetailsSummaryComponent', () => {
  let component: TournamentDetailsSummaryComponent;
  let fixture: ComponentFixture<TournamentDetailsSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentDetailsSummaryComponent]
    });
    fixture = TestBed.createComponent(TournamentDetailsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

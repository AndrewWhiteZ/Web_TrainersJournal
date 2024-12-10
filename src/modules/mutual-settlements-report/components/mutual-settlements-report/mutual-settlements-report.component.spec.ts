import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MutualSettlementsReportComponent } from './mutual-settlements-report.component';

describe('MutualSettlementsReportComponent', () => {
  let component: MutualSettlementsReportComponent;
  let fixture: ComponentFixture<MutualSettlementsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MutualSettlementsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MutualSettlementsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

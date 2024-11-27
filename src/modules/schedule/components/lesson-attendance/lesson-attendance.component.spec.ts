import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonAttendanceComponent } from './lesson-attendance.component';

describe('LessonAttendanceComponent', () => {
  let component: LessonAttendanceComponent;
  let fixture: ComponentFixture<LessonAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

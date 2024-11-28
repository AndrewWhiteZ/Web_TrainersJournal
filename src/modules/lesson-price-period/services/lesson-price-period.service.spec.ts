import { TestBed } from '@angular/core/testing';

import { LessonPricePeriodService } from './lesson-price-period.service';

describe('LessonPricePeriodService', () => {
  let service: LessonPricePeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonPricePeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

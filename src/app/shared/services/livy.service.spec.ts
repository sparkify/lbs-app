import { TestBed } from '@angular/core/testing';

import { LivyService } from './livy.service';

describe('LivyService', () => {
  let service: LivyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LivyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

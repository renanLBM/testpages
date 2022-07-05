import { TestBed } from '@angular/core/testing';

import { AuditorGuard } from './auditor.guard';

describe('AuditorGuard', () => {
  let guard: AuditorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuditorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

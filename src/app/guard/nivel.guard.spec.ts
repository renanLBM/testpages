import { TestBed } from '@angular/core/testing';

import { NivelGuard } from './nivel.guard';

describe('NivelGuard', () => {
  let guard: NivelGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NivelGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MotoristaGuard } from './motorista.guard';

describe('MotoristaGuard', () => {
  let guard: MotoristaGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MotoristaGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

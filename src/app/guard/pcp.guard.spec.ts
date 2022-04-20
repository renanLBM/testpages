import { TestBed } from '@angular/core/testing';

import { PcpGuard } from './pcp.guard';

describe('PcpGuard', () => {
  let guard: PcpGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PcpGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

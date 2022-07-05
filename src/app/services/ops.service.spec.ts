import { TestBed } from '@angular/core/testing';

import { OpsService } from './ops.service';

describe('OpsService', () => {
  let service: OpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

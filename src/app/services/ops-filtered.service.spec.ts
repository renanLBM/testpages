import { TestBed } from '@angular/core/testing';

import { OpsFilteredService } from './ops-filtered.service';

describe('OpsFilteredServiceService', () => {
  let service: OpsFilteredService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpsFilteredServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AtrasoService } from './atraso.service';

describe('AtrasoService', () => {
  let service: AtrasoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtrasoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

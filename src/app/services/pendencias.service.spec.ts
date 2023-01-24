import { TestBed } from '@angular/core/testing';

import { PendenciasService } from './pendencias.service';

describe('PendenciasService', () => {
  let service: PendenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

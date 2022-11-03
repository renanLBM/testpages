import { TestBed } from '@angular/core/testing';

import { ApontamentoService } from './apontamento.service';

describe('ApontamentoService', () => {
  let service: ApontamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApontamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

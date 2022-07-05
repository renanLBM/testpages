import { TestBed } from '@angular/core/testing';

import { SetTitleServiceService } from './set-title-service.service';

describe('SetTitleServiceService', () => {
  let service: SetTitleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetTitleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

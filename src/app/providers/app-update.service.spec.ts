import { TestBed } from '@angular/core/testing';

import { AppUpdateService } from './app-update.service';

describe('AppUpdateServiceService', () => {
  let service: AppUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

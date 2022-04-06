import { TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';

import { UserService } from './user.service';

describe(`${UserService.name}`, () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
    service = TestBed.inject(UserService);
  });

  it(`${UserService.name} should be created`, () => {
    expect(service).toBeTruthy();
  });
});

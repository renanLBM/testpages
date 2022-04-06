import { TestBed } from '@angular/core/testing';
import { AppModule } from '../app.module';
import { LoginGuard } from './login.guard';


describe('LoginGuard', () => {
  let guard: LoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });
    guard = TestBed.inject(LoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

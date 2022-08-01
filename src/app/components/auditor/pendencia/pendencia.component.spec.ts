import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendenciaComponent } from './pendencia.component';

describe('PendenciaComponent', () => {
  let component: PendenciaComponent;
  let fixture: ComponentFixture<PendenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

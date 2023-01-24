import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistPendenciaComponent } from './hist-pendencia.component';

describe('HistPendenciaComponent', () => {
  let component: HistPendenciaComponent;
  let fixture: ComponentFixture<HistPendenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistPendenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistPendenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

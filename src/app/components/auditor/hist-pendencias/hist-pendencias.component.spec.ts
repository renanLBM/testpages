import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistPendenciasComponent } from './hist-pendencias.component';

describe('HistPendenciasComponent', () => {
  let component: HistPendenciasComponent;
  let fixture: ComponentFixture<HistPendenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistPendenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistPendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

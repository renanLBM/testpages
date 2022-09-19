import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhasPendenciasComponent } from './minhas-pendencias.component';

describe('MinhasPendenciasComponent', () => {
  let component: MinhasPendenciasComponent;
  let fixture: ComponentFixture<MinhasPendenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinhasPendenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhasPendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

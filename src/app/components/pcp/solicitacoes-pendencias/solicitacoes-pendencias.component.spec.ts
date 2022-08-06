import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacoesPendenciasComponent } from './solicitacoes-pendencias.component';

describe('SolicitacoesPendenciasComponent', () => {
  let component: SolicitacoesPendenciasComponent;
  let fixture: ComponentFixture<SolicitacoesPendenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitacoesPendenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitacoesPendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

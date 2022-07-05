import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlteracoesComponent } from './alteracoes.component';

describe('AlteracoesComponent', () => {
  let component: AlteracoesComponent;
  let fixture: ComponentFixture<AlteracoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlteracoesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlteracoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

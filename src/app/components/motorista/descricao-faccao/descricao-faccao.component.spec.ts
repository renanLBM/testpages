import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescricaoFaccaoComponent } from './descricao-faccao.component';

describe('DescricaoFaccaoComponent', () => {
  let component: DescricaoFaccaoComponent;
  let fixture: ComponentFixture<DescricaoFaccaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescricaoFaccaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescricaoFaccaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

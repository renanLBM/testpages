import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFaccoesComponent } from './list-faccoes.component';

describe('ListFaccoesComponent', () => {
  let component: ListFaccoesComponent;
  let fixture: ComponentFixture<ListFaccoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFaccoesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFaccoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

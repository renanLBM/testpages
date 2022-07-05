import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescricaoStatusComponent } from './descricao-status.component';

describe('DescricaoStatusComponent', () => {
  let component: DescricaoStatusComponent;
  let fixture: ComponentFixture<DescricaoStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DescricaoStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DescricaoStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

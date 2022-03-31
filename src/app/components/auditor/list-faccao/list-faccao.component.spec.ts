import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFaccaoComponent } from './list-faccao.component';

describe('ListFaccaoComponent', () => {
  let component: ListFaccaoComponent;
  let fixture: ComponentFixture<ListFaccaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFaccaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFaccaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

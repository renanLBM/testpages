import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTableOpComponent } from './dialog-table-op.component';

describe('DialogTableOpComponent', () => {
  let component: DialogTableOpComponent;
  let fixture: ComponentFixture<DialogTableOpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogTableOpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTableOpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

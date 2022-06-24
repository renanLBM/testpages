import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDefaultBodyComponent } from './dialog-default-body.component';

describe('DialogDefaultBodyComponent', () => {
  let component: DialogDefaultBodyComponent;
  let fixture: ComponentFixture<DialogDefaultBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDefaultBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDefaultBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

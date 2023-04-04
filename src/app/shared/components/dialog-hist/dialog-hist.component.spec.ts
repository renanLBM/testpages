import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHistComponent } from './dialog-hist.component';

describe('DialogHistComponent', () => {
  let component: DialogHistComponent;
  let fixture: ComponentFixture<DialogHistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogHistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogHistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

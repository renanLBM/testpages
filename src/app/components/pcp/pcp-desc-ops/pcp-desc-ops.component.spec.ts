import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PcpDescOpsComponent } from './pcp-desc-ops.component';

describe('PcpDescOpsComponent', () => {
  let component: PcpDescOpsComponent;
  let fixture: ComponentFixture<PcpDescOpsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PcpDescOpsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PcpDescOpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

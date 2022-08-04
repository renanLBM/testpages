import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PCPPendenciasComponent } from './pcp-pendencias.component';


describe('PendenciasComponent', () => {
  let component: PCPPendenciasComponent;
  let fixture: ComponentFixture<PCPPendenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PCPPendenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PCPPendenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

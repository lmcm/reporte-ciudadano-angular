import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoReporteInvitadoComponent } from './nuevo-reporte-invitado.component';

describe('NuevoReporteInvitadoComponent', () => {
  let component: NuevoReporteInvitadoComponent;
  let fixture: ComponentFixture<NuevoReporteInvitadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoReporteInvitadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoReporteInvitadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

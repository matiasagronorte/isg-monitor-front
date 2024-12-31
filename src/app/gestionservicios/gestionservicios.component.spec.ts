import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionserviciosComponent } from './gestionservicios.component';

describe('GestionserviciosComponent', () => {
  let component: GestionserviciosComponent;
  let fixture: ComponentFixture<GestionserviciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionserviciosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionserviciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuthGuardComponent } from './admin-auth-guard.component';

describe('AdminAuthGuardComponent', () => {
  let component: AdminAuthGuardComponent;
  let fixture: ComponentFixture<AdminAuthGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAuthGuardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAuthGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

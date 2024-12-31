import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KazeFormInputComponent } from './kaze-form-input.component';

describe('KazeFormInputComponent', () => {
  let component: KazeFormInputComponent;
  let fixture: ComponentFixture<KazeFormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KazeFormInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KazeFormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

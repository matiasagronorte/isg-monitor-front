import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KazeFormSelectComponent } from './kaze-form-select.component';

describe('KazeFormSelectComponent', () => {
  let component: KazeFormSelectComponent;
  let fixture: ComponentFixture<KazeFormSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KazeFormSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KazeFormSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

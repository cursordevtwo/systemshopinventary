import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkInstructionsComponent } from './work-instructions.component';

describe('WorkInstructionsComponent', () => {
  let component: WorkInstructionsComponent;
  let fixture: ComponentFixture<WorkInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkInstructionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedA11y } from './shared-a11y';

describe('SharedA11y', () => {
  let component: SharedA11y;
  let fixture: ComponentFixture<SharedA11y>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedA11y],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedA11y);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

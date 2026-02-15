import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedState } from './shared-state';

describe('SharedState', () => {
  let component: SharedState;
  let fixture: ComponentFixture<SharedState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedState],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

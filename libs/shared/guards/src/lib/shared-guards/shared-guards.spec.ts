import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedGuards } from './shared-guards';

describe('SharedGuards', () => {
  let component: SharedGuards;
  let fixture: ComponentFixture<SharedGuards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedGuards],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedGuards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

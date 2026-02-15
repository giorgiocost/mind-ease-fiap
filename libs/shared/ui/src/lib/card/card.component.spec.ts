import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Variants', () => {
    it('should apply elevated variant by default', () => {
      expect(component.hostClasses()).toContain('card-elevated');
    });

    it('should apply flat variant', () => {
      fixture.componentRef.setInput('variant', 'flat');
      expect(component.hostClasses()).toContain('card-flat');
    });

    it('should apply outlined variant', () => {
      fixture.componentRef.setInput('variant', 'outlined');
      expect(component.hostClasses()).toContain('card-outlined');
    });

    it('should apply raised variant', () => {
      fixture.componentRef.setInput('variant', 'raised');
      expect(component.hostClasses()).toContain('card-raised');
    });
  });

  describe('Density', () => {
    it('should apply medium density by default', () => {
      expect(component.hostClasses()).toContain('card-density-medium');
    });

    it('should apply simple density', () => {
      fixture.componentRef.setInput('density', 'simple');
      expect(component.hostClasses()).toContain('card-density-simple');
    });

    it('should apply full density', () => {
      fixture.componentRef.setInput('density', 'full');
      expect(component.hostClasses()).toContain('card-density-full');
    });
  });

  describe('Clickable', () => {
    it('should not be clickable by default', () => {
      expect(component.hostClasses()).not.toContain('card-clickable');
    });

    it('should apply clickable class', () => {
      fixture.componentRef.setInput('clickable', true);
      expect(component.hostClasses()).toContain('card-clickable');
    });
  });

  describe('Accessibility', () => {
    it('should have role="article"', () => {
      expect(fixture.nativeElement.getAttribute('role')).toBe('article');
    });
  });

  describe('hostClasses computed', () => {
    it('should combine all classes correctly', () => {
      fixture.componentRef.setInput('variant', 'outlined');
      fixture.componentRef.setInput('density', 'full');
      fixture.componentRef.setInput('clickable', true);
      
      const classes = component.hostClasses();
      expect(classes).toContain('card-outlined');
      expect(classes).toContain('card-density-full');
      expect(classes).toContain('card-clickable');
    });

    it('should filter out empty classes', () => {
      fixture.componentRef.setInput('clickable', false);
      
      const classes = component.hostClasses();
      expect(classes).not.toContain('card-clickable');
    });
  });
});

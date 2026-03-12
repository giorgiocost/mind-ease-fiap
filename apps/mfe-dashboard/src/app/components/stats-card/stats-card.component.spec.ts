// apps/mfe-dashboard/src/app/components/stats-card/stats-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StatsCardComponent } from './stats-card.component';

describe('StatsCardComponent', () => {
  let component: StatsCardComponent;
  let fixture: ComponentFixture<StatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display icon', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Tasks');
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.stats-icon');
    expect(icon.textContent).toBe('📋');
  });

  it('should display label and value', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Pending Tasks');
    fixture.componentRef.setInput('value', 12);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.stats-label');
    const value = fixture.nativeElement.querySelector('.stats-value');

    expect(label.textContent).toBe('Pending Tasks');
    expect(value.textContent.trim()).toBe('12');
  });

  it('should display string value', () => {
    fixture.componentRef.setInput('icon', '⏱️');
    fixture.componentRef.setInput('label', 'Focus Time');
    fixture.componentRef.setInput('value', '1h 30min');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.stats-value');
    expect(value.textContent.trim()).toBe('1h 30min');
  });

  it('should apply variant data attribute', () => {
    fixture.componentRef.setInput('icon', '✅');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const statsCard = fixture.nativeElement.querySelector('.stats-card');
    expect(statsCard.getAttribute('data-variant')).toBe('success');
  });

  it('should show skeleton when loading', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('.skeleton');
    expect(skeleton).toBeTruthy();

    const statsCard = fixture.nativeElement.querySelector('.stats-card');
    expect(statsCard).toBeFalsy();
  });

  it('should emit clicked event when clickable', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.detectChanges();

    jest.spyOn(component.clicked, 'emit');

    component.handleClick();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit clicked when loading', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    jest.spyOn(component.clicked, 'emit');

    component.handleClick();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should not emit clicked when not clickable', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('clickable', false);
    fixture.detectChanges();

    jest.spyOn(component.clicked, 'emit');

    component.handleClick();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should display trend indicator when provided', () => {
    fixture.componentRef.setInput('icon', '✅');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('trend', 'up');
    fixture.componentRef.setInput('trendValue', '+5%');
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.stats-trend');
    expect(trend).toBeTruthy();
    expect(trend.textContent).toContain('+5%');
    expect(trend.classList.contains('trend-up')).toBe(true);
  });

  it('should display down trend with correct styling', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('trend', 'down');
    fixture.componentRef.setInput('trendValue', '-2');
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.stats-trend');
    expect(trend).toBeTruthy();
    expect(trend.textContent).toContain('-2');
    expect(trend.classList.contains('trend-down')).toBe(true);
  });

  it('should not display trend when only trend is provided', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.stats-trend');
    expect(trend).toBeFalsy();
  });

  it('should apply clickable class when clickable is true', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('clickable', true);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('ui-card');
    expect(card.classList.contains('clickable')).toBe(true);
  });

  it('should apply loading class when loading', () => {
    fixture.componentRef.setInput('icon', '📋');
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', 10);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('ui-card');
    expect(card.classList.contains('loading')).toBe(true);
  });
});

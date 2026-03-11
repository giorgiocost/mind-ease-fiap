import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { PreferencesStore } from '@shared/state';
import { Router, provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let preferencesStore: PreferencesStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        PreferencesStore,
      ],
    }).compileComponents();

    // Reset preferences to defaults before each test
    const store = TestBed.inject(PreferencesStore);
    store.resetToDefaults();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    preferencesStore = TestBed.inject(PreferencesStore);
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default state', () => {
      expect(component.sidebarCollapsed()).toBe(false);
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should detect mobile viewport on initialization', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      component.checkMobile();
      fixture.detectChanges();

      expect(component.isMobile()).toBe(true);
    });

    it('should detect desktop viewport on initialization', () => {
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      component.checkMobile();
      fixture.detectChanges();

      expect(component.isMobile()).toBe(false);
    });
  });

  describe('Sidebar visibility logic', () => {
    beforeEach(() => {
      // Reset to desktop mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();
      fixture.detectChanges();
    });

    it('should show sidebar by default on desktop', () => {
      expect(component.sidebarVisible()).toBe(true);
    });

    it('should keep sidebar visible when focus mode is active on desktop', async () => {
      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      expect(component.sidebarVisible()).toBe(true);
      expect(component.getLayoutClasses()['sidebar-collapsed']).toBe(true);
    });

    it('should hide sidebar on mobile when menu is closed', () => {
      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      expect(component.sidebarVisible()).toBe(false);
    });

    it('should show sidebar on mobile when menu is open', () => {
      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      // Initially sidebar should be hidden
      expect(component.sidebarVisible()).toBe(false);

      // Open mobile menu
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      expect(component.sidebarVisible()).toBe(true);
    });

    it('should keep sidebar visible when mobile menu is open, regardless of focus mode', async () => {
      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      component.mobileMenuOpen.set(true);
      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      // focus mode does not override mobile menu open state in sidebarVisible;
      // it only collapses the sidebar via CSS (getLayoutClasses)
      expect(component.sidebarVisible()).toBe(true);
    });
  });

  describe('Sidebar toggle', () => {
    it('should toggle sidebar collapsed state on desktop', () => {
      // Ensure desktop mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();
      fixture.detectChanges();

      expect(component.sidebarCollapsed()).toBe(false);

      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(true);

      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(false);
    });

    it('should not toggle sidebar collapsed on mobile', () => {
      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      component.toggleSidebar();
      expect(component.sidebarCollapsed()).toBe(false);
    });
  });

  describe('Mobile menu', () => {
    beforeEach(() => {
      // Switch to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();
    });

    it('should toggle mobile menu', () => {
      expect(component.mobileMenuOpen()).toBe(false);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(true);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should close mobile menu', () => {
      component.mobileMenuOpen.set(true);

      component.closeMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should close mobile menu when switching to desktop', () => {
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      // Switch to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();
      fixture.detectChanges();

      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should keep mobile menu open when focus mode is activated', async () => {
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      // focus mode does not close the mobile menu; only switching to desktop does
      expect(component.mobileMenuOpen()).toBe(true);
    });
  });

  describe('CSS classes', () => {
    it('should apply layout class', () => {
      const classes = component.getLayoutClasses();
      expect(classes['layout']).toBe(true);
    });

    it('should apply sidebar-collapsed class when collapsed on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();
      component.sidebarCollapsed.set(true);
      fixture.detectChanges();

      const classes = component.getLayoutClasses();
      expect(classes['sidebar-collapsed']).toBe(true);
    });

    it('should not apply sidebar-collapsed class on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      component.sidebarCollapsed.set(true);
      fixture.detectChanges();

      const classes = component.getLayoutClasses();
      expect(classes['sidebar-collapsed']).toBe(false);
    });

    it('should apply focus-mode class when active', async () => {
      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      const classes = component.getLayoutClasses();
      expect(classes['focus-mode']).toBe(true);
    });

    it('should apply mobile class on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      const classes = component.getLayoutClasses();
      expect(classes['mobile']).toBe(true);
    });

    it('should apply mobile-menu-open class when menu is open', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      // Open mobile menu
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      const classes = component.getLayoutClasses();
      expect(classes['mobile-menu-open']).toBe(true);
    });
  });

  describe('Template rendering', () => {
    it('should render header area with ng-content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.layout__header');
      expect(header).toBeTruthy();
    });

    it('should render sidebar when visible', () => {
      // Ensure desktop mode
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const sidebar = compiled.querySelector('.layout__sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should render sidebar and collapse the layout when in focus mode on desktop', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();

      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const sidebar = compiled.querySelector('.layout__sidebar');
      expect(sidebar).toBeTruthy();
      expect(compiled.querySelector('.layout')?.classList.contains('sidebar-collapsed')).toBe(true);
    });

    it('should render main content area with router-outlet', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('.layout__main');
      expect(main).toBeTruthy();

      const routerOutlet = compiled.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });

    it('should render overlay on mobile when menu is open', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      // Open mobile menu
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.layout__overlay');
      expect(overlay).toBeTruthy();
    });

    it('should close mobile menu when overlay is clicked', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      component.checkMobile();
      fixture.detectChanges();

      // Open mobile menu
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.layout__overlay') as HTMLElement;
      expect(overlay).toBeTruthy();

      overlay.click();
      fixture.detectChanges();

      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  describe('PreferencesStore integration', () => {
    it('should react to focus mode changes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component.checkMobile();

      expect(component.focusMode()).toBe(false);

      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      expect(component.focusMode()).toBe(true);
      expect(component.sidebarVisible()).toBe(true);
      expect(component.getLayoutClasses()['sidebar-collapsed']).toBe(true);
    });

    it('should reflect focus mode in computed signal', async () => {
      await preferencesStore.updatePreferences({ focusMode: true });
      fixture.detectChanges();

      expect(component.focusMode()).toBe(preferencesStore.focusMode());
    });
  });
});

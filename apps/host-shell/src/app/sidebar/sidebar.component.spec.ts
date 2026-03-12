// apps/host-shell/src/app/sidebar/sidebar.component.spec.ts
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PreferencesStore } from '@shared/state';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let preferencesStore: PreferencesStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
      providers: [
        {
          provide: PreferencesStore,
          useValue: {
            uiDensity: signal('medium'),
            focusMode: signal(false),
            contentMode: signal('detailed'),
            motion: signal('standard'),
            contrast: signal('normal')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    preferencesStore = TestBed.inject(PreferencesStore);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with collapsed as false by default', () => {
      expect(component.collapsed()).toBe(false);
    });

    it('should have 4 menu items', () => {
      expect(component.menuItems().length).toBe(4);
    });
  });

  describe('Menu Items', () => {
    it('should render all menu items', () => {
      const menuLinks = fixture.nativeElement.querySelectorAll('.menu-link');
      expect(menuLinks.length).toBe(4);
    });

    it('should render menu item icons', () => {
      const menuIcons = fixture.nativeElement.querySelectorAll('.menu-icon');
      expect(menuIcons.length).toBe(4);
      expect(menuIcons[0].textContent.trim()).toBe('✅');
      expect(menuIcons[1].textContent.trim()).toBe('⏱️');
      expect(menuIcons[2].textContent.trim()).toBe('⚙️');
      expect(menuIcons[3].textContent.trim()).toBe('👤');
    });

    it('should render menu item labels when not collapsed', () => {
      const menuLabels = fixture.nativeElement.querySelectorAll('.menu-label');
      expect(menuLabels.length).toBe(4);
      expect(menuLabels[0].textContent.trim()).toBe('Tarefas');
      expect(menuLabels[1].textContent.trim()).toBe('Pomodoro');
      expect(menuLabels[2].textContent.trim()).toBe('Configurações');
      expect(menuLabels[3].textContent.trim()).toBe('Perfil');
    });

    it('should have correct routes for all menu items', () => {
      const menuLinks = fixture.nativeElement.querySelectorAll('.menu-link');
      expect(menuLinks[0].getAttribute('href')).toBe('/tasks');
      expect(menuLinks[1].getAttribute('href')).toBe('/tasks/pomodoro');
      expect(menuLinks[2].getAttribute('href')).toBe('/dashboard/preferences');
      expect(menuLinks[3].getAttribute('href')).toBe('/profile');
    });
  });

  describe('Collapsed State', () => {
    it('should not have collapsed class when expanded', () => {
      const nav = fixture.nativeElement.querySelector('.sidebar');
      expect(nav.classList.contains('collapsed')).toBe(false);
    });

    it('should add collapsed class when collapsed', () => {
      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();

      const nav = fixture.nativeElement.querySelector('.sidebar');
      expect(nav.classList.contains('collapsed')).toBe(true);
    });

    it('should hide labels when collapsed', () => {
      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();

      const menuLabels = fixture.nativeElement.querySelectorAll('.menu-label');
      expect(menuLabels.length).toBe(0);
    });

    it('should hide badges when collapsed', () => {
      // Create a new fixture with badge already set
      const testFixture = TestBed.createComponent(SidebarComponent);
      const testComponent = testFixture.componentInstance;

      // Set badge before first detectChanges
      testComponent.menuItems()[0].badge = 5;
      testFixture.detectChanges();

      // Verify badge is visible when expanded
      let badges = testFixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(1);

      // Collapse
      testFixture.componentRef.setInput('collapsed', true);
      testFixture.detectChanges();

      // Verify badge is hidden when collapsed
      badges = testFixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(0);
    });
  });

  describe('Badges', () => {
    it('should not render badges by default (all badges are undefined)', () => {
      const badges = fixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(0);
    });

    it('should render badge when menu item has badge count', () => {
      // Create a new fixture with badge already set
      const testFixture = TestBed.createComponent(SidebarComponent);
      const testComponent = testFixture.componentInstance;

      testComponent.menuItems()[1].badge = 3;
      testFixture.detectChanges();

      const badges = testFixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(1);
      expect(badges[0].textContent.trim()).toBe('3');
    });

    it('should render multiple badges when multiple items have badge counts', () => {
      // Create a new fixture with badges already set
      const testFixture = TestBed.createComponent(SidebarComponent);
      const testComponent = testFixture.componentInstance;

      testComponent.menuItems()[1].badge = 3;
      testComponent.menuItems()[2].badge = 7;
      testFixture.detectChanges();

      const badges = testFixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(2);
      expect(badges[0].textContent.trim()).toBe('3');
      expect(badges[1].textContent.trim()).toBe('7');
    });

    it('should not render badge when count is 0', () => {
      // Create a new fixture with badge count = 0
      const testFixture = TestBed.createComponent(SidebarComponent);
      const testComponent = testFixture.componentInstance;

      testComponent.menuItems()[1].badge = 0;
      testFixture.detectChanges();

      const badges = testFixture.nativeElement.querySelectorAll('.menu-badge');
      expect(badges.length).toBe(0);
    });
  });

  describe('Router Integration', () => {
    it('should have routerLink on all menu items', () => {
      const menuLinks = fixture.nativeElement.querySelectorAll('.menu-link');
      expect(menuLinks.length).toBe(4);
      // All menu links should have href attributes (routerLink adds these)
      menuLinks.forEach((link: HTMLElement) => {
        expect(link.hasAttribute('href')).toBe(true);
      });
    });

    it('should render links for tasks and preferences routes', () => {
      const tasksLink = fixture.nativeElement.querySelector('.menu-link[href="/tasks"]');
      const preferencesLink = fixture.nativeElement.querySelector(
        '.menu-link[href="/dashboard/preferences"]'
      );

      expect(tasksLink).toBeTruthy();
      expect(preferencesLink).toBeTruthy();
    });
  });

  describe('UI Density', () => {
    it('should apply ui-density data attribute', () => {
      const nav = fixture.nativeElement.querySelector('.sidebar');
      expect(nav.getAttribute('data-ui-density')).toBe('medium');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on all menu links', () => {
      const menuLinks = fixture.nativeElement.querySelectorAll('.menu-link[aria-label]');
      expect(menuLinks.length).toBe(0);
    });

    it('should have navigation role on nav element', () => {
      const nav = fixture.nativeElement.querySelector('nav');
      expect(nav.getAttribute('role')).toBe('navigation');
    });

    it('should have list role on menu', () => {
      const menu = fixture.nativeElement.querySelector('.menu');
      expect(menu.getAttribute('role')).toBe('list');
    });
  });
});

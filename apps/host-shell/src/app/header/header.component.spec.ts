import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { AuthStore } from '@shared/state';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authStore: AuthStore;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        AuthStore,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);

    // Mock user data
    authStore['_user'].set({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString()
    });

    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with dropdown closed', () => {
      expect(component.dropdownOpen).toBe(false);
    });

    it('should have default notifications count', () => {
      expect(component.notificationsCount).toBe(3);
    });
  });

  describe('User data', () => {
    it('should display user name', () => {
      const userName = fixture.nativeElement.querySelector('.user-name');
      expect(userName.textContent.trim()).toBe('John Doe');
    });

    it('should calculate user initials for full name', () => {
      expect(component.userInitials()).toBe('JD');
    });

    it('should calculate user initials for single name', () => {
      authStore['_user'].set({
        id: '2',
        name: 'Madonna',
        email: 'madonna@example.com',
        createdAt: new Date().toISOString()
      });
      fixture.detectChanges();

      expect(component.userInitials()).toBe('M');
    });

    it('should return ? for missing user', () => {
      authStore['_user'].set(null);
      fixture.detectChanges();

      expect(component.userInitials()).toBe('?');
    });

    it('should display avatar with initials', () => {
      const avatar = fixture.nativeElement.querySelector('.avatar');
      expect(avatar.textContent.trim()).toBe('JD');
    });
  });

  describe('Sidebar toggle', () => {
    it('should emit toggleSidebar event on button click', () => {
      const emitSpy = vi.spyOn(component.toggleSidebar, 'emit');

      component.handleToggleSidebar();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit toggleSidebar when sidebar toggle button is clicked', () => {
      const emitSpy = vi.spyOn(component.toggleSidebar, 'emit');
      const button = fixture.nativeElement.querySelector('.sidebar-toggle');

      button.click();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('Dropdown menu', () => {
    it('should toggle dropdown state', () => {
      expect(component.dropdownOpen).toBe(false);

      component.toggleDropdown();
      expect(component.dropdownOpen).toBe(true);

      component.toggleDropdown();
      expect(component.dropdownOpen).toBe(false);
    });

    it('should open dropdown when user button is clicked', () => {
      const button = fixture.nativeElement.querySelector('.user-button');

      button.click();
      fixture.detectChanges();

      expect(component.dropdownOpen).toBe(true);
    });

    it('should render dropdown menu when open', () => {
      // Create new fixture and open dropdown before initial detectChanges
      const testFixture = TestBed.createComponent(HeaderComponent);
      const testComponent = testFixture.componentInstance;
      testComponent.dropdownOpen = true;
      testFixture.detectChanges();

      const menu = testFixture.nativeElement.querySelector('.dropdown-menu');
      expect(menu).toBeTruthy();
    });

    it('should not render dropdown menu when closed', () => {
      component.dropdownOpen = false;
      fixture.detectChanges();

      const menu = fixture.nativeElement.querySelector('.dropdown-menu');
      expect(menu).toBeFalsy();
    });

    it('should close dropdown', () => {
      component.dropdownOpen = true;

      component.closeDropdown();

      expect(component.dropdownOpen).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to profile and close dropdown', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.dropdownOpen = true;

      component.navigateToProfile();

      expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
      expect(component.dropdownOpen).toBe(false);
    });

    it('should navigate to preferences and close dropdown', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.dropdownOpen = true;

      component.navigateToPreferences();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/preferences']);
      expect(component.dropdownOpen).toBe(false);
    });

    it('should navigate to library and close dropdown', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.dropdownOpen = true;

      component.navigateToLibrary();

      expect(navigateSpy).toHaveBeenCalledWith(['/library']);
      expect(component.dropdownOpen).toBe(false);
    });

    it('should navigate to dashboard when logo is clicked', () => {
      const logo = fixture.nativeElement.querySelector('.logo');
      expect(logo.getAttribute('href')).toBe('/dashboard');
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to login', async () => {
      const logoutSpy = vi.spyOn(authStore, 'logout');
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.dropdownOpen = true;

      await component.handleLogout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.dropdownOpen).toBe(false);
    });
  });

  describe('Notifications', () => {
    it('should show notifications badge when count > 0', () => {
      // Create new fixture with updated notifications count
      const testFixture = TestBed.createComponent(HeaderComponent);
      const testComponent = testFixture.componentInstance;
      testComponent.notificationsCount = 5;
      testFixture.detectChanges();

      const badge = testFixture.nativeElement.querySelector('.badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('5');
    });

    it('should hide notifications badge when count is 0', () => {
      // Create new fixture with notifications count 0
      const testFixture = TestBed.createComponent(HeaderComponent);
      const testComponent = testFixture.componentInstance;
      testComponent.notificationsCount = 0;
      testFixture.detectChanges();

      const badge = testFixture.nativeElement.querySelector('.badge');
      expect(badge).toBeFalsy();
    });

    it('should render notifications button', () => {
      const button = fixture.nativeElement.querySelector('.notifications');
      expect(button).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for sidebar toggle', () => {
      const button = fixture.nativeElement.querySelector('.sidebar-toggle');
      expect(button.getAttribute('aria-label')).toBe('Toggle sidebar');
    });

    it('should have aria-label for notifications button', () => {
      const button = fixture.nativeElement.querySelector('.notifications');
      expect(button.getAttribute('aria-label')).toBe('Notifications');
    });

    it('should have aria-expanded for user button', () => {
      const button = fixture.nativeElement.querySelector('.user-button');
      expect(button.getAttribute('aria-expanded')).toBe('false');

      // Toggle dropdown
      button.click();
      fixture.detectChanges();

      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have aria-haspopup for user button', () => {
      const button = fixture.nativeElement.querySelector('.user-button');
      expect(button.getAttribute('aria-haspopup')).toBe('true');
    });
  });
});

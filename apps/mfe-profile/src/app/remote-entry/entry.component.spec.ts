import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { RemoteEntryComponent } from './entry';
import { AuthStore } from '@shared/state';

function mockAuthStore() {
  return {
    user: signal(null),
    accessToken: signal(null),
    refreshToken: signal(null),
    loading: signal(false),
    error: signal(null),
    isAuthenticated: signal(false),
    userName: signal(null),
    userEmail: signal(null),
  };
}

describe('RemoteEntryComponent', () => {
  let component: RemoteEntryComponent;
  let fixture: ComponentFixture<RemoteEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteEntryComponent],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockAuthStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render .profile-remote container', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.profile-remote')).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('should provide AuthStore', () => {
    const authStore = TestBed.inject(AuthStore);
    expect(authStore).toBeDefined();
  });

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });
});

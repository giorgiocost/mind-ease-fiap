import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore, PreferencesStore } from '@shared/state';
import { InputComponent } from '@shared/ui';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly preferencesStore = inject(PreferencesStore);

  // ── Forms ─────────────────────────────────────────────────
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // ── State ─────────────────────────────────────────────────
  readonly savingProfile = signal(false);
  readonly profileSaved = signal(false);
  readonly changingPassword = signal(false);
  readonly passwordChanged = signal(false);
  readonly error = signal<string | null>(null);

  // ── Selectors ─────────────────────────────────────────────
  readonly user        = this.authStore.user;
  readonly preferences = this.preferencesStore.preferences;
  readonly contentMode = computed(() => this.preferencesStore.contentMode());

  // ── Labels for preferences (Português) ───────────────────────
  uiDensityLabel(density?: string): string {
    switch (density) {
      case 'simple':
        return 'Simples';
      case 'medium':
        return 'Médio';
      case 'full':
        return 'Completo';
      default:
        return '';
    }
  }

  contrastLabel(contrast?: string): string {
    switch (contrast) {
      case 'low':
        return 'Baixo';
      case 'normal':
        return 'Normal';
      case 'high':
        return 'Alto';
      default:
        return '';
    }
  }

  motionLabel(motion?: string): string {
    switch (motion) {
      case 'full':
        return 'Completo';
      case 'reduced':
        return 'Reduzido';
      case 'off':
        return 'Desligado';
      default:
        return '';
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      name: [
        this.user()?.name ?? '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        this.user()?.email ?? '',
        [Validators.required, Validators.email]
      ]
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  // ── Profile ───────────────────────────────────────────────
  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.error.set(null);
    this.profileSaved.set(false);

    try {
      const { name, email } = this.profileForm.value as { name: string; email: string };
      await new Promise(resolve => setTimeout(resolve, 800)); // mock API
      this.authStore.updateUser({ name, email });
      this.profileSaved.set(true);
      setTimeout(() => this.profileSaved.set(false), 3000);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      this.savingProfile.set(false);
    }
  }

  // ── Password ──────────────────────────────────────────────
  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) return;

    this.changingPassword.set(true);
    this.error.set(null);
    this.passwordChanged.set(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // mock API
      this.passwordChanged.set(true);
      this.passwordForm.reset();
      setTimeout(() => this.passwordChanged.set(false), 3000);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      this.changingPassword.set(false);
    }
  }

  // ── Preferences ───────────────────────────────────────────
  async resyncPreferences(): Promise<void> {
    await this.preferencesStore.loadFromApi();
  }

  navigateToPreferences(): void {
    this.router.navigate(['/dashboard/preferences']);
  }

  // ── Danger zone ───────────────────────────────────────────
  async deleteAccount(): Promise<void> {
    const confirmed = confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.'
    );
    if (!confirmed) return;

    const input = prompt('Digite "EXCLUIR" para confirmar:');
    if (input !== 'EXCLUIR') return;

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // mock API
      this.authStore.logout();
      this.router.navigate(['/login']);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Erro ao excluir conta');
    }
  }

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}

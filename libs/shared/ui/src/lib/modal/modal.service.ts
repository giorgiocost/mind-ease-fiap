import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title?: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    onClick: () => void;
  }>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private _isOpen = signal(false);
  private _config = signal<ModalConfig | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly config = this._config.asReadonly();

  open(config: ModalConfig): void {
    this._config.set(config);
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
    setTimeout(() => this._config.set(null), 300); // Wait for animation
  }
}

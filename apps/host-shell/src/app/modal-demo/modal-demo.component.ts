import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent, ButtonComponent, ModalService } from '@shared/ui';

@Component({
  selector: 'app-modal-demo',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  templateUrl: './modal-demo.component.html',
  styleUrl: './modal-demo.component.scss',
})
export class ModalDemoComponent {
  // Injections
  private modalService = inject(ModalService);

  // Modal states
  confirmModal = signal(false);
  infoModal = signal(false);
  longContentModal = signal(false);
  sideModal = signal(false);
  fullscreenModal = signal(false);
  noBackdropModal = signal(false);

  // Data
  deleteCount = 0;

  handleDelete(): void {
    this.deleteCount++;
    console.log('Item deleted', this.deleteCount);
    this.confirmModal.set(false);
  }

  handleSave(): void {
    console.log('Changes saved');
    this.infoModal.set(false);
  }

  openServiceModal(): void {
    this.modalService.open({
      title: 'Modal via Service',
      content: 'Este modal foi aberto programaticamente usando o ModalService.',
      size: 'md',
      actions: [
        {
          label: 'Fechar',
          variant: 'secondary',
          onClick: () => this.modalService.close()
        },
        {
          label: 'Confirmar',
          variant: 'primary',
          onClick: () => {
            console.log('Confirmed via service');
            this.modalService.close();
          }
        }
      ]
    });
  }
}

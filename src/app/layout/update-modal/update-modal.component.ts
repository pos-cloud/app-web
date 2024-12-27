import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-update-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Nueva versión disponible</h4>
    </div>
    <div class="modal-body">
      <p>Una nueva versión de POS Cloud está disponible.</p>
      <p>
        Puedes ver los detalles
        <a href="https://docs.poscloud.ar/books/actualizaciones" target="_blank"
          >aquí</a
        >.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="reload()">
        Actualizar ahora
      </button>
    </div>
  `,
})
export class UpdateModalContent {
  @Output() onReload = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  reload() {
    this.onReload.emit();
  }
}

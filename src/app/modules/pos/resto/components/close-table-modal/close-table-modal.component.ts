import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Table } from '@types';

@Component({
  selector: 'app-close-table-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './close-table-modal.component.html',
  styleUrls: ['./close-table-modal.component.scss'],
})
export class CloseTableModalComponent {
  @Input() table: Table;

  constructor(public activeModal: NgbActiveModal) {}

  public cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  public confirm(): void {
    this.activeModal.close(true);
  }
}

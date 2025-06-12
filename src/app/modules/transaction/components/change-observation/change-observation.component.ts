import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-change-observation',
  templateUrl: './change-observation.component.html',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
})
export class ChangeObservationComponent {
  @Input() observation: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  accept() {
    this.activeModal.close(this.observation);
  }
}

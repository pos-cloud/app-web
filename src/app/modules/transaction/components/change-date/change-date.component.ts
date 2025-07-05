import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateTimePickerComponent } from '../../../../shared/components/datetime-picker/date-time-picker.component';

@Component({
  selector: 'app-change-date',
  templateUrl: './change-date.component.html',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule, DateTimePickerComponent],
})
export class ChangeDateComponent implements OnInit {
  @Input() currentDate: string = '';

  public endDate: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    // Si recibimos una fecha actual, la usamos, sino usamos la fecha actual
    if (this.currentDate) {
      // El datetime picker espera un string de fecha que pueda parsear
      this.endDate = this.currentDate;
    } else {
      // Usar fecha y hora actuales en formato ISO
      this.endDate = new Date().toISOString();
    }
  }

  accept() {
    // Validar que la fecha sea válida
    if (this.endDate && this.endDate.trim() !== '') {
      // El datetime picker ya devuelve el string en formato ISO con zona horaria
      // No necesitamos convertir, solo validar que sea una fecha válida
      const testDate = new Date(this.endDate);
      if (!isNaN(testDate.getTime())) {
        this.activeModal.close({
          endDate: this.endDate, // Ya está en el formato correcto
          success: true,
        });
      } else {
        this.activeModal.close('cancel');
      }
    } else {
      // Si no hay fecha válida, cerrar sin cambios
      this.activeModal.close('cancel');
    }
  }
}

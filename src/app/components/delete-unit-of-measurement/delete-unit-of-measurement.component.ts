import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UnitOfMeasurement } from './../../models/unit-of-measurement';

import { UnitOfMeasurementService } from './../../services/unit-of-measurement.service';

@Component({
  selector: 'app-delete-unit-of-measurement',
  templateUrl: './delete-unit-of-measurement.component.html',
  styleUrls: ['./delete-unit-of-measurement.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteUnitOfMeasurementComponent implements OnInit {

  @Input() unitOfMeasurement: UnitOfMeasurement;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _unitOfMeasurementService: UnitOfMeasurementService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteUnitOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.deleteUnitOfMeasurement(this.unitOfMeasurement._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}

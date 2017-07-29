import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeType } from './../../models/employee-type';

import { EmployeeTypeService } from './../../services/employee-type.service';

@Component({
  selector: 'app-delete-employee-type',
  templateUrl: './delete-employee-type.component.html',
  styleUrls: ['./delete-employee-type.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteEmployeeTypeComponent implements OnInit {

  @Input() employeeType: EmployeeType;
  public alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _employeeTypeService: EmployeeTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteEmployeeType(): void {

    this._employeeTypeService.deleteEmployeeType(this.employeeType._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}

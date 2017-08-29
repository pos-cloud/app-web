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
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _employeeTypeService: EmployeeTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteEmployeeType(): void {

    this.loading = true;
    
    this._employeeTypeService.deleteEmployeeType(this.employeeType._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}

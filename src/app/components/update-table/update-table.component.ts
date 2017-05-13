import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table } from './../../models/table';

import { TableService } from './../../services/table.service';

@Component({
  selector: 'app-update-table',
  templateUrl: './update-table.component.html',
  styleUrls: ['./update-table.component.css']
})
export class UpdateTableComponent implements OnInit {

  @Input() table: Table;
  private tableForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'description': '',
    'room': '',
    'chair' : 1
  };

  private validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    },
    'room': {
      'required':       'Este campo es requerido.'
    },
    'chair': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _tableService: TableService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.buildForm();
    this.tableForm.setValue({
      '_id':this.table._id,
      'description':this.table.description,
      'room': this.table.room,
      'chair': this.table.chair,
      'status': this.table.status
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.tableForm = this._fb.group({
      '_id': [this.table._id, [
        ]
      ],
      'description': [this.table.description, [
          Validators.required
        ]
      ],
      'room': [this.table.room, [
          Validators.required
        ]
      ],
      'chair': [this.table.chair, [
          Validators.required
        ]
      ],
      'status': [this.table.status, [
        ]
      ]
    });

    this.tableForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.tableForm) { return; }
    const form = this.tableForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  private updateTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
    this._tableService.updateTable(this.table).subscribe(
      result => {
        this.table = result.table;
        if (!this.table) {
          this.alertMessage = 'Ha ocurrido un error al querer crear el artículo.';
        } else {
          this.alertConfig.type = 'success';
          this.alertMessage = "El artículo se ha actualizado con éxito.";
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}

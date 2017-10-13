import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';
import { Room } from './../../models/room';

import { TableService } from './../../services/table.service';
import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-update-table',
  templateUrl: './update-table.component.html',
  styleUrls: ['./update-table.component.css']
})
export class UpdateTableComponent implements OnInit {

  @Input() table: Table;
  public states: TableState[] = [TableState.Available, TableState.Disabled, TableState.Reserved, TableState.Busy, TableState.Pending];
  @Input() readonly: boolean;
  public rooms: Room[] = new Array();
  public tableForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': '',
    'room': '',
    'chair' : 1
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.',
      'maxlength': 'No puede exceder los 5 carácteres.'
    },
    'room': {
      'required':       'Este campo es requerido.'
    },
    'chair': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _tableService: TableService,
    public _roomService: RoomService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getRooms();
    this.tableForm.setValue({
      '_id':this.table._id,
      'description':this.table.description,
      'room': this.table.room._id,
      'chair': this.table.chair,
      'state': this.table.state
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.tableForm = this._fb.group({
      '_id': [this.table._id, [
        ]
      ],
      'description': [this.table.description, [
          Validators.required,
          Validators.maxLength(5)
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
      'state': [this.table.state, [
        ]
      ]
    });

    this.tableForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

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

  public getRooms(): void {  

    this.loading = true;

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.rooms = result.rooms;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public updateTable(): void {

    if(this.table.state !== TableState.Pending && this.table.state !== TableState.Busy) {
      if(!this.readonly) {
        this.loading = true;
        this.table = this.tableForm.value;
        this.getRoom();
      }
    } else {
      this.showMessage("No se puede modificar una mesa en estado " + this.table.state, "info", true);
    }
  }

  public getRoom(): void {  
    
    this.loading = true;
    
    this._roomService.getRoom(this.tableForm.value.room).subscribe(
        result => {
          if(!result.room) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.table.room = result.room;
            this.saveChanges();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.table = result.table;
          this.showMessage("El artículo se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
        }
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

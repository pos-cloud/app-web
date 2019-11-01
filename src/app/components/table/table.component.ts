import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from '../../models/table';
import { Room } from '../../models/room';

import { TableService } from '../../services/table.service';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  providers: [NgbAlertConfig]
})

export class TableComponent  implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() tableId : string;
  public table: Table;
  public states: TableState[] = [TableState.Available, TableState.Disabled, TableState.Reserved];
  public rooms: Room[] = new Array();
  public tableForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': '',
    'room': '',
    'chair': '',
    'state': ''
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
    },
    'state': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _tableService: TableService,
    public _roomService: RoomService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    this.getRooms();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.table = new Table ();
    this.buildForm();

    if (this.tableId) {
      this.getTable();
    }

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
    this.focusEvent.emit(true);
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
          let room: Room  = new Room();
          if (!result.rooms) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.loading = false;
            this.rooms = result.rooms;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getTable() {

    this.loading = true;

    this._tableService.getTable(this.tableId).subscribe(
      result => {
        if (!result.table) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.table = result.table;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(){
    
    if (!this.table._id) { this.table._id = ''; }
    if (!this.table.description) { this.table.description = ''; }
    
    if (!this.table.chair) { this.table.chair = 0; }
    if (!this.table.state) { this.table.state = TableState.Available }

    let room;
    if (!this.table.room) {
      room = null;
    } else {
      if (this.table.room._id) {
        room = this.table.room._id;
      } else {
        room = this.table.room;
      }
    }
    
    this.tableForm.setValue({
      '_id':this.table._id,
      'description':this.table.description,
      'room': room,
      'chair': this.table.chair,
      'state': this.table.state
    });
  }

  public addTable(): void {
    
    switch (this.operation) {
      case 'add':
        this.saveTable();
        break;
      case 'update':
        this.updateTable();
        break;
      case 'delete' :
        this.deleteTable();
      default:
        break;
    }
  }

  public updateTable() {

    this.loading = true;

    this.table = this.tableForm.value;

    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('La mesa se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveTable(): void {
    
    this.loading = true;
    this.table = this.tableForm.value;

    this._tableService.saveTable(this.table).subscribe(
      result => {
        if (!result.table) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.table = result.table;
          this.showMessage("La mesa se ha añadido con éxito.", 'success', false);
          this.table = new Table ();
          this.buildForm();
          this.getRooms();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteTable() {

    this.loading = true;

    this._tableService.deleteTable(this.table._id).subscribe(
      result => {
        this.loading = false;
        if (!result.table) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.activeModal.close();
        }
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

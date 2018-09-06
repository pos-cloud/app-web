import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableState } from './../../models/table';
import { Room } from './../../models/room';

import { TableService } from './../../services/table.service';
import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-add-table',
  templateUrl: './add-table.component.html',
  styleUrls: ['./add-table.component.css'],
  providers: [NgbAlertConfig]
})

export class AddTableComponent  implements OnInit {

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
    'chair': 2,
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
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.table = new Table ();
    this.buildForm();
    this.getRooms();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.tableForm = this._fb.group({
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
            if (this.rooms[0] !== undefined) {
              room = this.rooms[0];
            }
          }
          this.tableForm.setValue({
            'room': room,
            'description': '',
            'chair': 2,
            'state': TableState.Available,
          });
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
   }

  public addTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;
    this.saveTable();
  }

  public saveTable(): void {
    
    this.loading = true;

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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}

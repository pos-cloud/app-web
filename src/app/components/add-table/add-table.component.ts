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
  public rooms: Room[] = new Array();
  public tableForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': '',
    'room': '',
    'chair': 1,
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.',
      'maxlength': 'No puede exceder los 6 carácteres.'
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
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

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
          Validators.maxLength(6)
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

    this._roomService.getRooms().subscribe(
        result => {
          let room: Room  = new Room();
          if(!result.rooms) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.rooms = result.rooms;
            if(this.rooms[0] !== undefined) {
              room = this.rooms[0];
            }
          }
          this.tableForm.setValue({
            'room': room,
            'description': '',
            'chair': 1,
            'state': TableState.Available,
          });
        },
        error => {
          this.alertMessage = error._body;
          if(!this.alertMessage) {
            this.alertMessage = "Ha ocurrido un error en el servidor";
          }
        }
      );
   }

  public addTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;
    this.saveTable();
  }

  public saveTable(): void {
    
    this._tableService.saveTable(this.table).subscribe(
    result => {
        if (!result.table) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.table = result.table;
          this.alertConfig.type = 'success';
          this.alertMessage = "La mesa se ha añadido con éxito.";  
          this.table = new Table ();
          this.buildForm();
          this.getRooms();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}

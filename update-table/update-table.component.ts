import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table } from './../../models/table';
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
  private rooms: Room[] = new Array();
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
    private _roomService: RoomService,
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
      'state': [this.table.state, [
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

  private getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            this.rooms = result.rooms;
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  private updateTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;
    this.getRoom();
  }

  private getRoom(): void {  
    
    this._roomService.getRoom(this.tableForm.value.room).subscribe(
        result => {
          if(!result.room) {
            this.alertMessage = result.message;
          } else {
            this.alertMessage = null;
            
            this.table.room = result.room;
            this.saveChanges();
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  private saveChanges(): void {
    
    this._tableService.updateTable(this.table).subscribe(
      result => {
        if (!result.table) {
          this.alertMessage = result.message;
        } else {
          this.table = result.table;
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

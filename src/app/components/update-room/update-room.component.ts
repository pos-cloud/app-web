import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Room } from './../../models/room';

import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-update-room',
  templateUrl: './update-room.component.html',
  styleUrls: ['./update-room.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateRoomComponent implements OnInit {

  @Input() room: Room;
  private roomForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'description': ''
  };

  private validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
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
    this.roomForm.setValue({
      '_id':this.room._id,
      'description': this.room.description
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.roomForm = this._fb.group({
      '_id': [this.room._id, [
        ]
      ],
      'description': [this.room.description, [
          Validators.required
        ]
      ],
    });

    this.roomForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.roomForm) { return; }
    const form = this.roomForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
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

  private updateRoom (): void {
    
    this.loading = true;
    this.room = this.roomForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
  this._roomService.updateRoom(this.room).subscribe(
    result => {
      this.room = result.room;
      if (!this.room) {
        this.alertMessage = 'Ha ocurrido un error al querer crear el salón.';
      } else {
        this.alertConfig.type = 'success';
        this.alertMessage = "El salón se ha actualizado con éxito.";
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
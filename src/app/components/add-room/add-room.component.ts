import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Room } from './../../models/room';

import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.component.html',
  styleUrls: ['./add-room.component.css'],
  providers: [NgbAlertConfig]
})

export class AddRoomComponent  implements OnInit {

  private room: Room;
  private roomForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  private focusEvent = new EventEmitter<boolean>();

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
    public alertConfig: NgbAlertConfig,
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
    this.room = new Room ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.roomForm = this._fb.group({
      'description': [this.room.description, [
          Validators.required
        ]
      ],
    });

    this.roomForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

    if (!this.roomForm) { return; }
    const form = this.roomForm;

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

  private addRoom(): void {
    this.loading = true;
    this.room = this.roomForm.value;
    this.saveRoom();
  }

  private saveRoom(): void {
    
    this._roomService.saveRoom(this.room).subscribe(
    result => {
        if (!this.room) {
          this.alertMessage = 'Ha ocurrido un error al querer crear el salón.';
        } else {
          this.room = result.room;
          this.alertConfig.type = 'success';
          this.alertMessage = "El salón se ha añadido con éxito.";      
          this.room = new Room ();
          this.buildForm();
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
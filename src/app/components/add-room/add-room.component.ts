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

  public room: Room;
  public roomForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
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
    this.room = new Room ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

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

  public onValueChanged(data?: any): void {

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

  public addRoom(): void {
    this.loading = true;
    this.room = this.roomForm.value;
    this.saveRoom();
  }

  public saveRoom(): void {
    
    this._roomService.saveRoom(this.room).subscribe(
    result => {
        if (!result.room) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
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
        console.log(error);
        // this.alertMessage = error._body;
        // if(!this.alertMessage) {
        //     this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        // }
        this.loading = false;
      }
    );
  }
}
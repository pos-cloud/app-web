import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Room } from '../room';

import { RoomService } from '../room.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css'],
    providers: [NgbAlertConfig]
})

export class RoomComponent implements OnInit {

    @Input() roomId: string;
    @Input() operation: string;
    @Input() readonly: boolean;
    public room: Room;
    public roomForm: FormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'description': ''
    };

    public validationMessages = {
        'description': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _roomService: RoomService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) {
        this.room = new Room();
    }

    ngOnInit(): void {


        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.roomId) {
            this.getRoom();
        }
    }

    public getRoom(): void {
        this._roomService.getRoom(this.roomId).subscribe(
            result => {
                if (!result.room) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.room = result.room;
                    this.setValueForm();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        )
    }

    public setValueForm(): void {

        if (!this.room._id) { this.room._id = ''; }
        if (!this.room.description) { this.room.description = ''; }

        this.roomForm.setValue({
            '_id': this.room._id,
            'description': this.room.description
        });
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.roomForm = this._fb.group({
            '_id': [this.room._id, []],
            'description': [this.room.description, [Validators.required]],
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

        switch (this.operation) {
            case 'add':
                this.saveRoom();
                break;
            case 'update':
                this.updateRoom();
                break;
            case 'delete':
                this.deleteRoom();
            default:
                break;
        }
    }

    public saveRoom(): void {

        this.loading = true;

        this._roomService.saveRoom(this.room).subscribe(
            result => {
                if (!result.room) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.room = result.room;
                    this.showMessage("El salón se ha añadido con éxito.", 'success', false);
                    this.room = new Room();
                    this.buildForm();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updateRoom(): void {

        this._roomService.updateRoom(this.room).subscribe(
            result => {
                if (!result.room) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.room = result.room;
                    this.showMessage("El salón se ha actualizado con éxito.", 'success', false);
                    this.activeModal.close('save_close');
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteRoom(): void {

        this.loading = true;

        this._roomService.deleteRoom(this.room._id).subscribe(
            result => {
                this.activeModal.close('delete_close');
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

    public hideMessage(): void {
        this.alertMessage = '';
    }
}
import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash } from '../movement-of-cash';

import { MovementOfCashService } from '../movement-of-cash.service';

@Component({
    selector: 'app-delete-movement-of-cash',
    templateUrl: './delete-movement-of-cash.component.html',
    styleUrls: ['./delete-movement-of-cash.component.css'],
    providers: [NgbAlertConfig]
})

export class DeleteMovementOfCashComponent implements OnInit {

    @Input() movementOfCash: MovementOfCash;
    public alertMessage: string = '';
    public focusEvent = new EventEmitter<boolean>();
    public loading: boolean = false;

    constructor(
        public _movementOfCashService: MovementOfCashService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) { }

    ngOnInit(): void { }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public deleteMovementOfCash(): void {

        this.loading = true;

        this._movementOfCashService.delete(this.movementOfCash._id).subscribe(
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
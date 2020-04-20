import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { ShipmentMethod } from 'app/components/shipment-method/shipment-method';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shipment-method',
  templateUrl: './shipment-method.component.html',
  styleUrls: ['./shipment-method.component.css']
})
export class ShipmentMethodComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() shipmentMethodId: string;
    public alertMessage: string = '';
    public userType: string;
    public shipmentMethod: ShipmentMethod;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public userCountry: string;
    public shipmentMethodForm: FormGroup;
    public orientation: string = 'horizontal';

    public formErrors = {
        'name': '',
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public alertConfig: NgbAlertConfig,
        public _shipmentMethodService: ShipmentMethodService,
        public _router: Router,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.shipmentMethod = new ShipmentMethod();
    }

    ngOnInit() {
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];;
        this.buildForm();

        if (this.shipmentMethodId) {
            this.getShipmentMethod();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getShipmentMethod() {

        this.loading = true;

        let match = `{
            "_id": { "$oid": "${this.shipmentMethodId}" }
        }`

        match = JSON.parse(match)

        let project = {
            name: 1,
            operationType : 1,
            creationDate : { "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } },
            "updateUser.name" : 1,
            "creationUser.name" : 1,
            updateDate : { "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }
        }

        this._shipmentMethodService.getShipmentMethods(project,match,{},{},1,0).subscribe(
            result => {
                if (!result.shipmentMethods) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'susses', true);
                } else {
                    this.hideMessage();
                    this.shipmentMethod = result.shipmentMethods[0];
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

    public setValueForm(): void {


        if (!this.shipmentMethod._id) { this.shipmentMethod._id = ''; }
        if (!this.shipmentMethod.name) { this.shipmentMethod.name = ''; }


        const values = {
            '_id': this.shipmentMethod._id,
            'name': this.shipmentMethod.name,
        };
        this.shipmentMethodForm.setValue(values);
    }

    public buildForm(): void {

        this.shipmentMethodForm = this._fb.group({
            '_id': [this.shipmentMethod._id, []],
            'name': [this.shipmentMethod.name, [ Validators.required]]
        });

        this.shipmentMethodForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.shipmentMethodForm) { return; }
        const form = this.shipmentMethodForm;

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

    public addShipmentMethod() {

        this.shipmentMethod = this.shipmentMethodForm.value;


        switch (this.operation) {
            case 'add':
                this.saveShipmentMethod();
                break;
            case 'edit':
                this.updateShipmentMethod();
                break;
            case 'delete':
                this.deleteShipmentMethod();
            default:
                break;
        }
    }

    public updateShipmentMethod() {

        this.loading = true;

        this.shipmentMethod = this.shipmentMethodForm.value;

        this._shipmentMethodService.updateShipmentMethod(this.shipmentMethod).subscribe(
            result => {
                if (!result.shipmentMethod) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El método se ha actualizado con éxito.', 'success', false);
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public saveShipmentMethod() {

        this.loading = true;

        this.shipmentMethod = this.shipmentMethodForm.value;

        this._shipmentMethodService.saveShipmentMethod(this.shipmentMethod).subscribe(
            result => {
                if (!result.shipmentMethod) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'success', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El método se ha añadido con éxito.', 'success', false);
                    this.shipmentMethod = new ShipmentMethod();
                    this.buildForm();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteShipmentMethod() {

        this.loading = true;

        this._shipmentMethodService.deleteShipmentMethod(this.shipmentMethod._id).subscribe(
            result => {
                this.loading = false;
                if (!result.shipmentMethod) {
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'danger', true); }
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

    public hideMessage(): void {
        this.alertMessage = '';
    }


}

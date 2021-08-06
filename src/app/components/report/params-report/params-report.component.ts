import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AuthService } from 'app/components/login/auth.service';
import { Transport } from 'app/components/transport/transport';
import { TransportService } from 'app/components/transport/transport.service';
import { Report } from '../report.model';

@Component({
    selector: 'app-params-report',
    templateUrl: './params-report.component.html',
    styleUrls: ['./params-report.component.scss'],
    encapsulation : ViewEncapsulation.None
})
export class ParamsReportComponent implements OnInit {

    @Input() report : Report;
    public transportSelected: Transport;
    public alertMessage: string = '';
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public declaredValue: number;
    public package: number;
    public objForm: FormGroup;

    constructor(
        public _fb: FormBuilder,
        public _authService: AuthService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
    ) { }

    async ngOnInit() {
        console.log(this.report);
        this.buildForm();
    }

    public buildForm(): void {
        let fields: {} = {};

        for (let field of this.report.params) {
            fields[field.name] = [ field.name, []]
        }

        this.objForm = this._fb.group(fields);
    }

    public sendParams(): void {

        console.log(this.objForm.value);

        var params : [{
            name : string,
            value : any
        }]

        params = this.objForm.value


        this.activeModal.close(this.objForm.value);
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

import { Component, OnInit, Input, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { User } from 'app/components/user/user';
import { AuthService } from 'app/components/login/auth.service';
import { Subscription } from 'rxjs';
import { CompanyType, Company } from 'app/components/company/company';
import { CompanyService } from 'app/components/company/company.service';
import { AddCompanyComponent } from '../company/add-company.component';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-select-company',
    templateUrl: './select-company.component.html',
    styleUrls: ['./select-company.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SelectCompanyComponent implements OnInit {

    @Input() type: CompanyType;
    @Input() userType: string;
    public identity: User;
    public companies: Company[];
    public areCompaniesEmpty: boolean = true;
    public alertMessage: string = '';
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public itemsPerPage = 10;
    public totalItems = 0;
    public userCountry: string;
    private subscription: Subscription = new Subscription();
    public focusEvent = new EventEmitter<boolean>();
    public currentPage: number = 0;
    public displayedColumns = [
        "_id",
        "name",
        "fantasyName",
        "identificationValue",
        "address",
        "addressNumber",
        "phones",
        "vatCondition.description",
        "type",
        "operationType"
    ];

    public filters: any[];
    public filterValue: string;

    constructor(
        public _companyService: CompanyService,
        public _router: Router,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _authService: AuthService
    ) {
        this.companies = new Array();
        this.filters = new Array();
        for (let field of this.displayedColumns) {
            this.filters[field] = "";
        }
    }

    ngOnInit(): void {
        this._authService.getIdentity.subscribe(
            identity => {
                this.identity = identity;
            }
        );
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');

        if (!this.userType) {
            this.userType = pathLocation[1];
        }
        this.getCompaniesByType();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getCompaniesByType(): void {

        this.loading = true;

        this.loading = true;

        // ORDENAMOS LA CONSULTA
        let sortAux;
        if (this.orderTerm[0].charAt(0) === '-') {
            sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
        } else {
            sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
        }
        sortAux = JSON.parse(sortAux);

        // FILTRAMOS LA CONSULTA
        let match = `{`;
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let value = this.filters[this.displayedColumns[i]];
            if (value && value != "") {
                match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"},`;
            }
        }


      

        match += `  "operationType": { "$ne": "D" },
                    "type" : "${this.type.toString()}"
            `;            
        if (this.identity.permission.filterCompany && this.identity.employee._id) {
            match += `,"employee._id": { "$oid" : "${this.identity.employee._id}"}}`
        } else {
            match += `}`
        }

        match = JSON.parse(match);

        let project = {
            _id: 1,
            name: 1,
            fantasyName: 1,
            identificationValue: 1,
            address: 1,
            addressNumber: 1,
            phones: 1,
            "vatCondition.description": 1,
            "employee._id" : 1,
            emails: 1,
            type: 1,
            operationType: 1
        }

        let group = {
            _id: null,
            count: { $sum: 1 },
            companies: { $push: '$$ROOT' }
        };

        let page = 0;
        if (this.currentPage != 0) {
            page = this.currentPage - 1;
        }
        let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP
        let limit = this.itemsPerPage;

        this.subscription.add(this._companyService.getCompaniesV2(project, match, { name: 1 }, group, limit, skip).subscribe(
            result => {
                if (result && result[0] && result[0].companies) {
                    this.hideMessage();
                    this.loading = false;
                    this.companies = result[0].companies;
                    this.totalItems = this.companies.length;
                    this.areCompaniesEmpty = false;
                } else {
                    this.loading = false;
                    this.companies = new Array();
                    this.areCompaniesEmpty = true;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        ));
    }

    public pageChange(page): void {
        this.currentPage = page;
        this.getCompaniesByType();
    }

    public orderBy(term: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = '-' + term;
        } else {
            this.orderTerm[0] = term;
        }

        this.getCompaniesByType();
    }

    public refresh(): void {
        this.getCompaniesByType();
    }

    public openModal(op: string, company: Company): void {

        let modalRef;
        switch (op) {
            case 'add':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = 'add';
                modalRef.componentInstance.companyType = this.type;
                modalRef.result.then((result) => {
                    this.selectCompany(result.company);
                }, (reason) => {
                    this.getCompaniesByType();
                });
                break;
            default: ;
        }
    };

    public selectCompany(companySelected: Company): void {
        if(companySelected) {
            this._companyService.getCompany(companySelected._id).subscribe(
                result => {
                    if (result && result.company) {
                        this.activeModal.close({ company: result.company });
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            )
        }
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
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

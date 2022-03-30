import { Component, OnInit, Input, ViewEncapsulation, EventEmitter, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Company, CompanyType, attributes } from '../company';
import { Config } from '../../../app.config';
import { CompanyService } from '../company.service';
import { AddCompanyComponent } from '../company/add-company.component';
import { ImportComponent } from '../../import/import.component';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/components/login/auth.service';
import { Subscription } from 'rxjs';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { first } from 'rxjs/operators';
import { DatatableHistory } from 'app/components/datatable/datatable-history.interface';
import { importExcelComponent } from "../../import-excel/import-excel.component";
@Component({
    selector: 'app-list-companies',
    templateUrl: './list-companies.component.html',
    styleUrls: ['./list-companies.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListCompaniesComponent implements OnInit {

    @Input() type: CompanyType;
    @Input() userType: string;
    @Input() selectionView: boolean = false;
    public identity: User;
    public companies: Company[];
    public actions = {
        add: true,
        edit: true,
        delete: true,
        export: true
    };
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
    public employee: string;
    public title: string = "Empresas"
    public currentPage: number = 0;
    public columns = attributes;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    public sort = {
        "name": 1
    };
    public timezone = "-03:00";
    @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
    public items: any[] = new Array();
    public filters: any[];

    constructor(
        public _companyService: CompanyService,
        public _router: Router,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _authService: AuthService,
        private _route: ActivatedRoute
    ) {
        this.filters = new Array();
        for (let field of this.columns) {
            if (field.defaultFilter) {
                this.filters[field.name] = field.defaultFilter;
            } else {
                this.filters[field.name] = "";
            }
        }
        this.processParams();
    }

    ngOnInit(): void {
        this._authService.getIdentity.pipe(first()).subscribe(
            identity => {
                this.identity = identity;
            }
        );

        if (this.identity.permission && this.identity.permission.collections) {
            this.identity.permission.collections.forEach(element => {
                if (element.name === "empresas") {
                    this.actions = element.actions;
                }
            });
        }

        this.userCountry = Config.country;
        let datatableHistory: DatatableHistory;
        let pathLocation: string[] = this._router.url.split('/');
        if (pathLocation[2] === "clientes") {
            this.type = CompanyType.Client;
            this.subscription.add(this._companyService.getClients.pipe(first()).subscribe(
                async result => {
                    datatableHistory = result;
                }
            ));
        } else if (pathLocation[2] === "proveedores") {
            this.type = CompanyType.Provider;
            this.subscription.add(this._companyService.getProviders.pipe(first()).subscribe(
                async result => {
                    datatableHistory = result;
                }
            ));
        }

        if (!this.userType) {
            this.userType = pathLocation[1];
        }

        if (datatableHistory) {
            this.items = datatableHistory.items;
            this.totalItems = datatableHistory.count;
            this.filters = datatableHistory.filters;
            this.itemsPerPage = datatableHistory.itemsPerPage;
            this.currentPage = datatableHistory.currentPage;
        } else {
            this.getItems();
        }
        this.initDragHorizontalScroll();
    }

    public initDragHorizontalScroll(): void {
        const slider = document.querySelector('.table-responsive');
        if(slider) {
            let isDown = false;
            let startX;
            let scrollLeft;
    
            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.classList.add('active');
                startX = e['pageX'] - slider['offsetLeft'];
                scrollLeft = slider.scrollLeft;
            });
            slider.addEventListener('mouseleave', () => {
                isDown = false;
                slider.classList.remove('active');
            });
            slider.addEventListener('mouseup', () => {
                isDown = false;
                slider.classList.remove('active');
            });
            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e['pageX'] - slider['offsetLeft'];
                const walk = (x - startX) * 0.7; //scroll-fast
                slider.scrollLeft = scrollLeft - walk;
            });
        }
    }

    private processParams(): void {
        this._route.queryParams.subscribe(params => {
            if (params['employee']) {
                this.employee = params['employee'];

                let pathLocation: string[] = this._router.url.split('/');

                let listType = pathLocation[2].split('?')[0];

                if (listType === "clientes") {
                    this.type = CompanyType.Client;
                } else if (listType === "proveedores") {
                    this.type = CompanyType.Provider;
                }
            }
        });
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getItems(): void {

        this.loading = true;

        // FILTRAMOS LA CONSULTA
        let match = `{`;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible || this.columns[i].required) {
                let value = this.filters[this.columns[i].name];
                if (value && value != "" && value !== {}) {
                    if (this.columns[i].defaultFilter) {
                        match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
                    } else {
                        match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
                    }
                    if (i < this.columns.length - 1) {
                        match += ',';
                    }
                }
            }
        }

        match += `,"companyType": "${this.type}"`;
        if (this.employee) {
            match += `,"employee._id": { "$oid" : "${this.employee}"}`
        }
        if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

        match += `}`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = `{`;
        let j = 0;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible || this.columns[i].required) {
                if (j > 0) {
                    project += `,`;
                }
                j++;
                if (this.columns[i].project) {
                    project += `"${this.columns[i].name}" : ${this.columns[i].project}`
                } else {
                    if (this.columns[i].datatype !== "string") {
                        if (this.columns[i].datatype === "date") {
                            project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`
                        } else {
                            project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
                        }
                    } else {
                        project += `"${this.columns[i].name}": 1`;
                    }
                }

            }
        }
        project += `}`;

        project = JSON.parse(project);

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            items: { $push: "$$ROOT" }
        };

        let page = 0;
        if (this.currentPage != 0) {
            page = this.currentPage - 1;
        }
        let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP
        let limit = this.itemsPerPage;

        this.subscription.add(this._companyService.getCompaniesV2(
            project, // PROJECT
            match, // MATCH
            this.sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].items) {
                    if (this.itemsPerPage === 0) {
                        this.exportExcelComponent.items = result[0].items;
                        this.exportExcelComponent.export();
                        this.itemsPerPage = 10;
                        this.getItems();
                    } else {
                        this.items = result[0].items;
                        this.totalItems = result[0].count;
                        let datatableHistory: DatatableHistory = {
                            items: this.items,
                            count: this.totalItems,
                            filters: this.filters,
                            itemsPerPage: this.itemsPerPage,
                            currentPage: this.currentPage
                        };
                        if (this.type === CompanyType.Client) {
                            this._companyService.setClients(datatableHistory);
                        } else if (this.type === CompanyType.Provider) {
                            this._companyService.setProviders(datatableHistory);
                        }
                    }
                } else {
                    this.items = new Array();
                    this.totalItems = 0;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        ));
    }

    public exportItems(): void {
        this.itemsPerPage = 0;
        this.getItems();
    }

    public getValue(item, column): any {
        let val: string = 'item';
        let exists: boolean = true;
        let value: any = '';
        for (let a of column.name.split('.')) {
            val += '.' + a;
            if (exists && !eval(val)) {
                exists = false;
            }
        }
        if (exists) {
            switch (column.datatype) {
                case 'number':
                    value = this.roundNumberPipe.transform(eval(val));
                    break;
                case 'currency':
                    value = this.currencyPipe.transform(this.roundNumberPipe.transform(eval(val)), 'USD', 'symbol-narrow', '1.2-2');
                    break;
                case 'percent':
                    value = this.roundNumberPipe.transform(eval(val)) + '%';
                    break;
                default:
                    value = eval(val);
                    break;
            }
        }
        return value;
    }

    public getColumnsVisibles(): number {
        let count: number = 0;
        for (let column of this.columns) {
            if (column.visible) {
                count++;
            }
        }
        return count;
    }

    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }


    public pageChange(page): void {
        this.currentPage = page;
        this.getItems();
    }

    public orderBy(term: string): void {

        if (this.sort[term]) {
            this.sort[term] *= -1;
        } else {
            this.sort = JSON.parse('{"' + term + '": 1 }');
        }

        this.getItems();
    }

    public refresh(): void {
        this.getItems();
    }

    public openModal(op: string, company: Company): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.companyId = company._id;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = 'view';
                break;
            case 'add':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = 'add';
                modalRef.componentInstance.companyType = this.type;
                modalRef.result.then((result) => {
                    this.getItems();
                }, (reason) => {
                    this.getItems();
                });
                break;
            case 'update':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.companyId = company._id;
                modalRef.componentInstance.readonly = false;
                modalRef.componentInstance.operation = 'update';
                modalRef.result.then((result) => {
                    this.getItems();
                }, (reason) => {
                    this.getItems();
                });
                break;
            case 'delete':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.company = company;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = 'delete';
                modalRef.result.then((result) => {
                    this.getItems();
                }, (reason) => {
                    this.getItems();
                });
                break;
            case 'account':
                this._router.navigateByUrl("admin/cuentas-corrientes?companyId=" + company._id + "&companyType=" + this.type)
                break;

            case "excel":
                modalRef = this._modalService.open(importExcelComponent, {
                    size: "lg",
                    backdrop: "static",
                });
                modalRef.result.then(
                    (result) => {
                        if (result === "import_close") {
                            this.getItems();
                        }
                    },
                    (reason) => { }
                );
                break;
            case 'import':
                modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
                let model: any = new Company();
                model.relations = new Array();
                model.model = "company";
                model.primaryKey = "code";
                model.code = '';
                model.name = '';
                model.fantasyName = '';
                model.type = '';
                model.relations.push("identification-type_relation_name");
                model.identificationValue = '';
                model.grossIncome = '';
                model.address = '';
                model.addressNumber = '';
                model.city = '';
                model.relations.push("state_relation_name");
                model.relations.push("country_relation_name");
                model.phones = '';
                model.emails = '';
                model.birthday = '';
                model.observation = '';
                model.gender = '';
                model.relations.push("employee_relation_name");
                model.relations.push("transport_relation_name");
                model.relations.push("vat-condition_relation_description");
                modalRef.componentInstance.model = model;
                modalRef.result.then((result) => {
                    if (result === 'import_close') {
                        this.getItems();
                    }
                }, (reason) => {

                });
                break;
            default: ;
        }
    };

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

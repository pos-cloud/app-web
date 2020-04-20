import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { BranchService } from '../branch.service'
import { Branch } from '../branch'
import { BranchComponent } from '../branch/branch.component'
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';


@Component({
    selector: 'app-list-branches',
    templateUrl: './list-branches.component.html',
    styleUrls: ['./list-branches.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListBranchComponent implements OnInit {

    public alertMessage: string = '';
    public userType: string;
    public branches: Branch[] = new Array();
    public relationOfBranchEmpty: boolean = true;
    public orderTerm: string[] = ['number'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public userCountry: string;

    public itemsPerPage = 10;
    public totalItems = 0;

    public currentPage: number = 0;
    public displayedColumns = [
        "number",
        "name",
        "operationType"
    ];
    public filters: any[];
    public filterValue: string;

    constructor(
        public alertConfig: NgbAlertConfig,
        public _branchService: BranchService,
        public _router: Router,
        public _modalService: NgbModal,
    ) {
        this.filters = new Array();
        for (let field of this.displayedColumns) {
            this.filters[field] = "";
        }
    }

    ngOnInit() {
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.getBranches()
    }

    public getBranches(): void {

        this.loading = true;

        /// ORDENAMOS LA CONSULTA
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
                match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
                match += ',';
            }
        }

        match += `"operationType": { "$ne": "D" } }`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            number: { $toString: '$number' },
            name: 1,
            default: 1,
            operationType: 1
        }

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            branches: { $push: "$$ROOT" }
        };

        let page = 0;
        if (this.currentPage != 0) {
            page = this.currentPage - 1;
        }
        let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP

        this._branchService.getBranches(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            this.itemsPerPage, // LIMIT
            skip // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].branches) {
                    this.branches = result[0].branches;
                    this.totalItems = result[0].count;
                    this.relationOfBranchEmpty = false;
                } else {
                    this.branches = new Array();
                    this.totalItems = 0;
                    this.relationOfBranchEmpty = true;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        );
    }

    public pageChange(page): void {
        this.currentPage = page;
        this.getBranches();
    }

    public orderBy(term: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        }
        this.getBranches();
    }

    public openModal(op: string, branch?: Branch): void {

        let modalRef
        switch (op) {
            case 'add':
                modalRef = this._modalService.open(BranchComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = "add";
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    this.getBranches();
                }, (reason) => {
                    this.getBranches();
                });
                break;
            case 'edit':
                modalRef = this._modalService.open(BranchComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = "edit";
                modalRef.componentInstance.branchId = branch._id;
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    this.getBranches();
                }, (reason) => {
                    this.getBranches();
                });
                break;
            case 'delete':
                modalRef = this._modalService.open(BranchComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = "delete";
                modalRef.componentInstance.branchId = branch._id;
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    this.getBranches();
                }, (reason) => {
                    this.getBranches();
                });
                break;
            case 'view':
                modalRef = this._modalService.open(BranchComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = "view";
                modalRef.componentInstance.branchId = branch._id;
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                }, (reason) => {
                });
                break;
            default:
                break;
        }

    }

    public refresh(): void {
        this.getBranches();
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


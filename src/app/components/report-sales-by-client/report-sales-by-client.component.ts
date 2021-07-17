import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from '../company/company.service';
import { Config } from 'app/app.config';
import { AuthService } from 'app/components/login/auth.service';
import { BranchService } from 'app/components/branch/branch.service';
import { Branch } from 'app/components/branch/branch';
import { Subscription } from 'rxjs';
import { TransactionService } from '../transaction/transaction.service';
import { CompanyType } from '../company/company';
import { TransactionType } from '../transaction-type/transaction-type';
import { TransactionTypeService } from '../transaction-type/transaction-type.service';

@Component({
    selector: 'app-report-sales-by-client',
    templateUrl: './report-sales-by-client.component.html',
    styleUrls: ['./report-sales-by-client.component.css'],
    providers: [NgbAlertConfig]
})

export class ReportSalesByClientComponent implements OnInit {

    public items: any[] = new Array();
    public areCompaniesEmpty: boolean = true;
    public alertMessage: string = '';
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    @Input() startDate: string;
    @Input() startTime: string;
    @Input() endDate: string;
    @Input() endTime: string;
    @Input() limit: number = 0;
    public listType: string = 'statistics';
    public itemsPerPage: string = "5";
    public currentPage: number = 1;
    public totalItems = 0;
    public sort = { "count": -1 };
    public transactionMovement: string;
    public totalItem;
    public totalAmount;
    public branches: Branch[];
    @Input() branchSelectedId: String;
    public allowChangeBranch: boolean;
    private subscription: Subscription = new Subscription();
    public stateSelect: string = "Cerrado";

    public selectedItems;
    public transactionTypes: TransactionType[];
    public transactionTypesSelect;
    public dropdownSettings = {
        "singleSelection": false,
        "defaultOpen": false,
        "idField": "_id",
        "textField": "name",
        "selectAllText": "Select All",
        "unSelectAllText": "UnSelect All",
        "enableCheckAll": true,
        "itemsShowLimit": 3,
        "allowSearchFilter": true
    }

    constructor(
        public _companyService: CompanyService,
        public _transactionService: TransactionService,
        public _transactionTypeService : TransactionTypeService, 
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig,
        private _branchService: BranchService,
        private _authService: AuthService
    ) {
        this.startDate = moment().format('YYYY-MM-DD');
        this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
        this.endDate = moment().format('YYYY-MM-DD');
        this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
        this.totalItem = 0;
        this.totalAmount = 0;
    }

    async ngOnInit() {

        if (!this.branchSelectedId) {
            await this.getBranches({ operationType: { $ne: 'D' } }).then(
                branches => {
                    this.branches = branches;
                    if (this.branches && this.branches.length > 1) {
                        this.branchSelectedId = this.branches[0]._id;
                    }
                }
            );
            this._authService.getIdentity.subscribe(
                async identity => {
                    if (identity && identity.origin) {
                        this.allowChangeBranch = false;
                        this.branchSelectedId = identity.origin.branch._id;
                    } else {
                        this.allowChangeBranch = true;
                        this.branchSelectedId = null;
                    }
                }
            );
        }

        await this.getTransactionTypes().then(
            result => {
                if (result) {
                    this.transactionTypes = result
                }
            }
        )

        this.getSalesByCompany();
    }

    public getBranches(match: {} = {}): Promise<Branch[]> {

        return new Promise<Branch[]>((resolve, reject) => {

            this._branchService.getBranches(
                {}, // PROJECT
                match, // MATCH
                { number: 1 }, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    if (result && result.branches) {
                        resolve(result.branches);
                    } else {
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getSalesByCompany(): void {

        this.loading = true;
        let pathLocation: string[] = this._router.url.split('/');
        this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
        this.listType = pathLocation[3];

        let companyType: CompanyType;

        if (this.transactionMovement === "Venta") {
            companyType = CompanyType.Client
        } else if (this.transactionMovement === "Compra") {
            companyType = CompanyType.Provider
        }

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        /*let query = {
            type: this.transactionMovement,
            movement: movement,
            currentAccount: "Si",
            modifyStock: true,
            startDate: this.startDate + " " + this.startTime + timezone,
            endDate: this.endDate + " " + this.endTime + timezone,
            sort: this.sort,
            limit: this.limit,
            branch: this.branchSelectedId
        }*/

        let project = {
            "operationType": 1,
            "company.operationType": 1,
            "company.type": 1,
            "company.name": 1,
            "endDate": 1,
            "state": 1,
            "type._id" : 1,
            "type.movement": 1,
            count: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.movement", "Entrada"] }
                                ]
                        }, 1, -1
                    ],
            },
            totalPrice: {
                $cond:
                    [
                        {
                            $and:
                                [
                                    { $eq: ["$type.movement", "Entrada"] }
                                ]
                        }, "$totalPrice", { $multiply: ["$totalPrice", -1] }
                    ],
            },
        }

        let match = {
            "operationType ": { "$ne": "D" },
            "company.operationType ": { "$ne": "D" },
            "company.type": companyType,
            "company": { "$exists": true, "$ne": null },
            "endDate": {
                "$gte": { "$date": this.startDate + "T00:00:00" + timezone },
                "$lte": { "$date": this.endDate + "T23:59:59" + timezone }
            },
            "state" : this.stateSelect
        }

        var transactionTypes = [];

        if (this.transactionTypesSelect) {
            this.transactionTypesSelect.forEach(element => {
                transactionTypes.push({ "$oid": element._id });
            });
            match['type._id'] = { "$in": transactionTypes }
        }

        let group = {
            _id: "$company",
            count: { $sum: "$count" },
            total: { $sum: "$totalPrice" }
        }

        let asd = {
            project: project,
            match: match,
            group: group,
            limit: 0,
            skip: 0
        }

        let fullquery  = [];

        fullquery.push(
            {
                $lookup: {
                    from: "companies",
                    localField: "company",
                    foreignField: "_id",
                    as: "company"
                }
            },
            { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "transaction-types",
                    localField: "type",
                    foreignField: "_id",
                    as: "type"
                }
            },
            { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },

            { $project : project },
            { $match : match },
            { $group : group },
            { $project : {
                company: "$_id",
            count: 1,
            total: 1
            } },
            { $sort : this.sort }
        )

        if(this.limit && this.limit > 0){
            fullquery.push({ $limit : this.limit })
        }

        this.subscription.add(this._transactionService.getFullQuery(fullquery).subscribe(
            result => {

                if (result && result.status == 200) {
                    this.hideMessage();
                    this.loading = false;
                    this.items = result.result
                    this.areCompaniesEmpty = false;
                    this.calculateTotal()
                } else {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.items = new Array();
                    this.areCompaniesEmpty = true;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        ));
    }

    public calculateTotal(): void {

        this.totalItem = 0;
        this.totalAmount = 0;

        for (let index = 0; index < this.items.length; index++) {
            this.totalItem = this.totalItem + this.items[index]['count'];
            this.totalAmount = this.totalAmount + this.items[index]['total'];
        }
    }

    public getTransactionTypes(): Promise<TransactionType[]> {

        return new Promise<TransactionType[]>((resolve, reject) => {

            let match = {}

            match = {
                requestArticles: true,
                transactionMovement: this.transactionMovement,
                operationType: { "$ne": "D" }
            }

            this._transactionTypeService.getAll({
                project: {
                    _id: 1,
                    transactionMovement: 1,
                    requestArticles: 1,
                    operationType: 1,
                    name: 1,
                    branch: 1,
                },
                match: match
            }).subscribe(
                result => {
                    if (result) {
                        resolve(result.result);
                    } else {
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public orderBy(term: string): void {

        if (this.sort[term]) {
            this.sort[term] *= -1;
        } else {
            this.sort = JSON.parse('{"' + term + '": 1 }');
        }

        this.getSalesByCompany();
    }

    public refresh(): void {
        this.getSalesByCompany();
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

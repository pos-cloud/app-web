import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { MovementOfCash, StatusCheck } from 'app/components/movement-of-cash/movement-of-cash';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TransactionState } from 'app/components/transaction/transaction';
import { EditCheckComponent } from '../edit-check/edit-check.component';
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component';
import { TransactionType } from 'app/components/transaction-type/transaction-type';

@Component({
    selector: 'app-select-checks',
    templateUrl: './select-checks.component.html',
    styleUrls: ['./select-checks.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SelectChecksComponent implements OnInit {

    @Input() transactionAmount: number;
    @Input() paymentMethod: PaymentMethod;
    @Input() transactionType : TransactionType;
    public movementsOfCashes: MovementOfCash[] = new Array();
    public movementsOfCashesSelected: MovementOfCash[] = new Array();
    public areMovementOfCashesEmpty = true;
    public userType: string;
    public alertMessage = '';
    public orderTerm: string[] = ['expirationDate'];
    public propertyTerm: string;
    public areFiltersVisible = false;
    public loading = false;
    @Output() eventAddItem: EventEmitter<MovementOfCash> = new EventEmitter<MovementOfCash>();
    public itemsPerPage = 10;
    public totalItems = 0;
    public transactionMovement: string;
    public pathLocation: string[]
    public totalAmountSelected: number = 0;
    public totalAmount: number = 0;

    public currentPage: number = 0;
    public displayedColumns = [
        "_id",
        "transaction.endDate",
        "transaction.cashBox.number",
        "quota",
        "discount",
        "number",
        "statusCheck",
        "observation",
        "bank._id",
        "bank.name",
        "amountPaid",
        "operationType",
        "expirationDate",
        "transaction._id",
        "transaction.state",
        "transaction.type.name",
        "transaction.type.transactionMovement",
        "date",
        "titular",
        "receiver",
        "type._id",
        "type.name",
        "deliveredBy",
        "CUIT",
        "transaction.operationType"
    ];
    public filters: any[];
    public filterValue: string;


    constructor(
        public _movementOfCashService: MovementOfCashService,
        public _router: Router,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        this.filters = new Array();
        for (let field of this.displayedColumns) {
            this.filters[field] = "";
        }
        if (this.paymentMethod) {
            this.filters['type._id'] = this.paymentMethod._id;
        }
    }

    ngOnInit() {

        this.pathLocation = this._router.url.split('/');
        this.userType = this.pathLocation[1];
        this.transactionMovement = this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1);
        this.getMovementOfCashes();
    }

    public getMovementOfCashes(): void {

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

        match += `"operationType": { "$ne": "D" },
                "transaction.state": "${TransactionState.Closed}",
                "transaction.operationType": { "$ne": "D" },`;


        match += `"statusCheck": "${StatusCheck.Available}","type.inputAndOuput" : true }`;


        match = JSON.parse(match);

        let project = {};
        // CAMPOS A TRAER

        project = {
            "_id": 1,
            "number": 1,
            "bank._id": 1,
            "bank.name": 1,
            "amountPaid": 1,
            "operationType": 1,
            "expirationDate": { $dateToString: { date: "$expirationDate", format: "%d/%m/%Y", timezone: "-03:00" } },
            "transaction._id": 1,
            "transaction.state": 1,
            "transaction.type.name": 1,
            "transaction.type.transactionMovement": 1,
            "date": 1,
            "statusCheck": 1,
            "titular": 1,
            "receiver": 1,
            "quota": 1,
            "type._id": { $toString: '$type._id' },
            "type.name": 1,
            "type.inputAndOuput": 1,
            "deliveredBy": 1,
            "CUIT": 1,
            "observation": 1,
            "transaction.operationType": 1
        }

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            movementsOfCashes: { $push: '$$ROOT' }
        };

        let limit = this.itemsPerPage;
        let page = 0;
        if (this.currentPage != 0) {
            page = this.currentPage - 1;
        }
        let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP


        this._movementOfCashService.getMovementsOfCashesV2(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].movementsOfCashes) {
                    this.movementsOfCashes = result[0].movementsOfCashes;
                    this.totalItems = result[0].count;
                    this.areMovementOfCashesEmpty = false;
                    this.calculateTotal();
                } else {
                    this.movementsOfCashes = new Array();
                    this.totalItems = 0;
                    this.areMovementOfCashesEmpty = true;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        );
    }

    public orderBy(term: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = '-' + term;
        } else {
            this.orderTerm[0] = term;
        }

        this.getMovementOfCashes();
    }

    public openModal(op: string, movementOfCash: MovementOfCash): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
                modalRef.componentInstance.readonly = true;
                break;
            case 'edit':
                modalRef = this._modalService.open(EditCheckComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.movementOfCashId = movementOfCash._id;
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    this.getMovementOfCashes();
                }, (reason) => {
                    this.getMovementOfCashes();
                });
                break;
            default: ;
        }
    };

    public calculateTotal(): void {
        this.totalAmount = 0;
        for (let movementofCash of this.movementsOfCashes) {
            this.totalAmount = this.totalAmount + parseFloat(movementofCash.amountPaid.toString());
        }
    }

    public addItem(movementOfCashSelected) {
        this.eventAddItem.emit(movementOfCashSelected);
    }

    public async selectmovementOfCash(movementOfCashSelected: MovementOfCash) {

        let movementOfCash = await this.getMovementOfCashById(movementOfCashSelected._id);
        if (this.isMovementOfCashSelected(movementOfCash)) {
            this.deleteMovementOfCashSelected(movementOfCash);
        } else {
            if (this.transactionAmount === 0 || (this.transactionAmount >= (this.totalAmountSelected + movementOfCash.amountPaid)) || this.transactionType.allowZero) {
                this.totalAmountSelected += movementOfCash.amountPaid;
                this.movementsOfCashesSelected.push(movementOfCash);
            } else {
                this.deleteMovementOfCashSelected(movementOfCash);
                if (this.pathLocation[2] !== "fondos") {
                    this.showMessage("El monto $" + movementOfCashSelected.amountPaid + " es superior al de la transacción.", 'info', false);
                }
            }
        }
    }

    public isMovementOfCashSelected(movementOfCash: MovementOfCash) {

        let isSelected: boolean = false;

        for (let mov of this.movementsOfCashesSelected) {
            if (mov._id.toString() === movementOfCash._id.toString()) {
                isSelected = true;
            }
        }

        return isSelected;
    }

    public deleteMovementOfCashSelected(movementOfCash: MovementOfCash): void {

        let movementToDelete: number;

        for (let i = 0; i < this.movementsOfCashesSelected.length; i++) {
            if (this.movementsOfCashesSelected[i]._id.toString() === movementOfCash._id.toString()) {
                movementToDelete = i;
            }
        }
        if (movementToDelete !== undefined) {
            this.totalAmountSelected -= this.movementsOfCashesSelected[movementToDelete].amountPaid;
            this.movementsOfCashesSelected.splice(movementToDelete, 1);
        }
    }

    public closeModal(): void {
        this.activeModal.close(
            {
                movementsOfCashes: this.movementsOfCashesSelected
            }
        );
    }

    public getMovementOfCashById(id: string): Promise<MovementOfCash> {

        return new Promise<MovementOfCash>((resolve, reject) => {

            this._movementOfCashService.getMovementOfCash(id).subscribe(
                async result => {
                    if (!result.movementOfCash) {
                        this.showMessage(result.message, 'danger', false);
                        resolve(null);
                    } else {
                        resolve(result.movementOfCash);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public pageChange(page): void {
        this.currentPage = page;
        this.getMovementOfCashes();
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

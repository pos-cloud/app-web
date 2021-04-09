import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';




import { Currency } from 'app/components/currency/currency';
import { CurrencyService } from 'app/components/currency/currency.service';
import { Config } from 'app/app.config';
import { CashBox, CashBoxState } from 'app/components/cash-box/cash-box';
import { CashBoxService } from 'app/components/cash-box/cash-box.service';
import { Company, CompanyType } from 'app/components/company/company';
import { Table, TableState } from 'app/components/table/table';
import { TableService } from 'app/components/table/table.service';
import { AuthService } from 'app/components/login/auth.service';
import { DepositService } from 'app/components/deposit/deposit.service';
import { Deposit } from 'app/components/deposit/deposit';
import { BranchService } from 'app/components/branch/branch.service';
import { Branch } from 'app/components/branch/branch';
import { Origin } from 'app/components/origin/origin';
import { OriginService } from 'app/components/origin/origin.service';
import { ConfigService } from 'app/components/config/config.service';
import { Subscription } from 'rxjs';
import { User } from 'app/components/user/user';
import { UserService } from 'app/components/user/user.service';
import { ClaimService } from 'app/layout/claim/claim.service';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Room } from 'app/components/room/room';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { Printer } from 'app/components/printer/printer';
import { EmployeeType } from 'app/components/employee-type/employee-type.model';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { RoomService } from 'app/components/room/room.service';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { PrinterService } from 'app/components/printer/printer.service';
import { EmailService } from 'app/components/send-email/send-email.service';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { MercadopagoService } from 'app/components/mercadopago/mercadopago.service';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { DeleteTransactionComponent } from 'app/components/transaction/delete-transaction/delete-transaction.component';

@Component({
    selector: 'app-abandoned-carts',
    templateUrl: './abandoned-carts.component.html',
    styleUrls: ['./abandoned-carts.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe],
    encapsulation: ViewEncapsulation.None
})

export class AbandonedCartsComponent implements OnInit {

    public rooms: Room[] = new Array();
    public roomSelected: Room;
    public transactions: Transaction[] = new Array();
    public transactionStates: string[];
    public validTransactionStates: string[] = [
        TransactionState.Delivered.toString(),
        TransactionState.Open.toString(),
        TransactionState.Pending.toString(),
        TransactionState.Sent.toString(),
        TransactionState.Preparing.toString(),
        TransactionState.Packing.toString(),
        TransactionState.Outstanding.toString(),
        TransactionState.PaymentDeclined.toString(),
        TransactionState.PaymentConfirmed.toString()
    ];
    public originsToFilter: number[];
    public transactionTypes: TransactionType[];
    public transactionMovement: TransactionMovement = TransactionMovement.Sale;
    public userType: string;
    public propertyTerm: string;
    public orderTerm: string[] = ['startDate'];
    public posType: string;
    public alertMessage: string = '';
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public itemsPerPage = 10;
    public printers: Printer[];
    @ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
    @Output() eventRefreshCurrentAccount: EventEmitter<any> = new EventEmitter<any>();
    public transaction: Transaction;
    public printerSelected: Printer;
    public employeeTypeSelected: EmployeeType;
    public tableSelected: Table;
    public config: Config;
    public transactionTypeId: string;
    private subscription: Subscription = new Subscription();
    public identity: User;
    public user: User;
    public movementsOfCashes: MovementOfCash[];

    public filterEndDate;
    public filterType;
    public filterNumber;
    public filterCompany;
    public filterOrderNumber;
    public filterState;
    filterObservation;
    filterTotalPrice;
    p;
    // CAMPOS TRAIDOS DE LA CUENTA CTE.
    @Input() company: Company;
    public companyType: CompanyType;
    @Input() totalPrice: number;

    constructor(
        public alertConfig: NgbAlertConfig,
        private _roomService: RoomService,
        private _transactionService: TransactionService,
        private _transactionTypeService: TransactionTypeService,
        private _printerService: PrinterService,
        private _depositService: DepositService,
        private _branchService: BranchService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _modalService: NgbModal,
        private _currencyService: CurrencyService,
        private _cashBoxService: CashBoxService,
        private _tableService: TableService,
        private _authService: AuthService,
        private _originService: OriginService,
        private _configService: ConfigService,
        private _userService: UserService,
        private _claimService: ClaimService,
        private _emailService: EmailService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
        private _movementOfCashService: MovementOfCashService,
        private _mercadopagoService: MercadopagoService
    ) {
        this.roomSelected = new Room();
        this.transactionTypes = new Array();
        this.originsToFilter = new Array();
    }

    async ngOnInit() {

        this.refresh();
    }

    async refresh(){
            await this.getTransactionsV2().then(
                transactions => {
                    if(transactions){
                        this.transactions = transactions;
                    } else {
                        this.showToast("No se encontraron transacciones")
                    }
                }
            ); 
    }

    public orderBy(term: string, property?: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        }
        this.propertyTerm = property;
    }


    public getTransactionsV2(): Promise<Transaction[]> {

        return new Promise<Transaction[]>((resolve, reject) => {

            this.loading = true;

            let project = {
                _id: 1,
                startDate: 1,
                endDate: 1,
                origin: 1,
                number: 1,
                orderNumber: 1,
                observation: 1,
                totalPrice: 1,
                balance: 1,
                state: 1,
                madein: 1,
                operationType: 1,
                taxes: 1,
                CAE: 1,
                "type._id": 1,
                "type.allowEdit": 1,
                "type.name": 1,
                "type.level": 1,
                "type.transactionMovement": 1,
                "type.electronics": 1,
                "type.paymentMethods": 1,
                "branchOrigin": 1,
                "deliveryAddress.name": 1,
                "deliveryAddress.number": 1,
                "deliveryAddress.floor": 1,
                "deliveryAddress.flat": 1,
                "deliveryAddress.city": 1,
                "deliveryAddress.state": 1,
                "deliveryAddress.observation": 1,
                "shipmentMethod.name": 1,
                "paymentMethodEcommerce": 1
            }

            let match = {
                state: TransactionState.Open,
                madein: 'pedidos-web',
                totalPrice: { $gt: 0 },
                operationType: { $ne: 'D' },
                "type.transactionMovement": this.transactionMovement,
            }

            let sort: {} = { startDate: -1 };

            if (this.posType === 'pedidos-web' || this.posType === 'carritos-abandonados') {
                sort = { endDate: 1 };
                this.orderTerm = ['endDate'];
            }

            this.subscription.add(this._transactionService.getTransactionsV2(
                project, // PROJECT
                match, // MATCH
                sort, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    this.loading = false;
                    if(result && result.transactions){
                        resolve(result.transactions);
                    } else {
                        this.showToast(result);
                    }
                },
                error => {
                    this.showToast(error._body, 'danger');
                    this.loading = false;
                    resolve(new Array());
                }
            ));
        });
    }

    public getUser(): Promise<User> {

        return new Promise<User>((resolve, reject) => {

            var identity: User = JSON.parse(sessionStorage.getItem('user'));
            var user;
            if (identity) {
                this._userService.getUser(identity._id).subscribe(
                    result => {
                        if (result && result.user) {
                            resolve(result.user)
                        } else {
                            this.showToast("Debe volver a iniciar sesión", "danger");
                        }
                    },
                    error => {
                        this.showToast(error._body, "danger");
                    }
                )
            }
        });
    }

    public deleteAll() {
        
        this.loading = true;

        let where = {
            state: TransactionState.Open,
            madein: 'pedidos-web',
            totalPrice: { $gt: 0 },
            operationType: { $ne: 'D' },
            //"type.transactionMovement": this.transactionMovement,
        }
        
        this._transactionService.deleteAll({where : where}).subscribe(
            result =>{
                if(result && result.status === 200){
                    this.showToast(result.message);
                } else {
                    if(result.status === 500){
                        this.showToast(result.error,'danger');
                    } else {
                        this.showToast(result.result,'danger')
                    }
                }
                this.loading = false;
            },
            error =>{
                this.showToast(error, "danger");
                this.loading=false
            }
        )
    }

    public async viewTransaction(transaction: Transaction) {
        if (transaction) {
            this.openModal('view-transaction', transaction);
        }
    }

    public async cancelTransaction(transaction: Transaction) {
        if (transaction) {
            this.openModal('cancel-transaction', transaction);
        }
    }

    async openModal(op: string, transaction : Transaction) {

        let modalRef;

        switch (op) {
            case 'view-transaction':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                break;
            case 'cancel-transaction':
                modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                modalRef.result.then((result) => {
                    if (result === "delete_close") {
                        this.refresh();
                    }
                }, (reason) => {

                });
                break;
            default: ;
        }
    }

    public showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
            if (result.status === 200) {
                type = 'success';
                title = result.message;
            } else if (result.status >= 400) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            } else {
                type = 'info';
                title = result.message;
            }
        }
        switch (type) {
            case 'success':
                this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            case 'danger':
                this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            default:
                this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
        }
        this.loading = false;
    }
}
//Paquetes de Angular
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from '../transaction';
import { TransactionMovement, Movements } from '../../transaction-type/transaction-type';
import { Company, CompanyType } from '../../company/company';
import { Taxes } from '../../tax/taxes';

//Services
import { TransactionService } from '../transaction.service';
import { TransactionTypeService } from '../../transaction-type/transaction-type.service';
import { CompanyService } from '../../company/company.service';
import { EmployeeService } from '../../employee/employee.service';

//Pipes
import { DateFormatPipe } from '../../../main/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { CashBoxService } from './../../../components/cash-box/cash-box.service';
import { UserService } from './../../../components/user/user.service';
import { Config } from './../../../app.config';
import { MovementOfCancellationComponent } from '../../movement-of-cancellation/movement-of-cancellation.component';
import { MovementOfCancellation } from './../../../components/movement-of-cancellation/movement-of-cancellation';
import { MovementOfCancellationService } from './../../../components/movement-of-cancellation/movement-of-cancellation.service';
import { CancellationTypeService } from './../../../components/cancellation-type/cancellation-type.service';
import { SelectCompanyComponent } from '../../company/select-company/select-company.component';
import { Employee } from '../../employee/employee';
import { TaxBase, TaxClassification } from '../../tax/tax';
import { MovementOfCash } from './../../../components/movement-of-cash/movement-of-cash';
import { Account } from './../../../components/account/account';
import { AccountService } from './../../../components/account/account.service';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import Resulteable from './../../../util/Resulteable';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from './../../../main/pipes/translate-me';

@Component({
    selector: 'app-add-transaction',
    templateUrl: './add-transaction.component.html',
    styleUrls: ['./add-transaction.component.css'],
    providers: [NgbAlertConfig, DateFormatPipe, TranslateMePipe]
})

export class AddTransactionComponent implements OnInit {

    @Input() transactionId: string;
    public transactionForm: FormGroup;
    public companies: Company[];
    public transaction: Transaction;
    public taxes: Taxes[] = new Array();
    private movementsOfCancellations: MovementOfCancellation[];
    public alertMessage: string = '';
    public existsCancellations: boolean = false;
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public posType: string;
    public datePipe = new DateFormatPipe();
    public letters: string[] = ["", "A", "B", "C", "D", "E", "M", "R", "T", "X"];
    public roundNumber = new RoundNumberPipe();
    public transactionMovement: string;
    public employees: Employee[] = new Array();
    public readonly: boolean = false;
    public states: TransactionState[] = [
        TransactionState.Open,
        TransactionState.Closed,
        TransactionState.Packing,
        TransactionState.Delivered,
        TransactionState.Sent,
        TransactionState.Preparing,
        TransactionState.Outstanding,
        TransactionState.PaymentConfirmed,
        TransactionState.PaymentDeclined,
        TransactionState.Pending,
    ];
    public companyName: string = "Consumidor Final";
    public transactionDate: string;
    public userCountry: string;
    public showButtonCancelation: boolean;
    public filtersTaxClassification: TaxClassification[] = [TaxClassification.Perception, TaxClassification.Withholding];
    public balanceTotal: number = -1; // SE ASIGNA -1 PARA VALIDAR SI SE NECESITA RECALCULAR EL SALDO, O SE EDITA MANUALMENTE.
    public movementsOfCashes: MovementOfCash[];

    public formErrors = {
        'date': '',
        'origin': '',
        'letter': '',
        'number': '',
        'VATPeriod': '',
        'basePrice': '',
        'exempt': '',
        'totalPrice': '',
        'company': '',
        'employeeOpening': '',
        'account': ''
    };

    public validationMessages = {
        'company': { 'required': 'Este campo es requerido.' },
        'date': { 'required': 'Este campo es requerido.' },
        'origin': { 'required': 'Este campo es requerido.' },
        'letter': { 'required': 'Este campo es requerido.' },
        'number': { 'required': 'Este campo es requerido.' },
        'VATPeriod': { 'required': 'Este campo es requerido.' },
        'basePrice': { 'required': 'Este campo es requerido.' },
        'exempt': { 'required': 'Este campo es requerido.' },
        'totalPrice': { 'required': 'Este campo es requerido.' },
        'employeeOpening': {},
        'account': {}
    };

    public searchAccounts = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' }, mode: "Analitico", operationType: { $ne: "D" } } : {};
                return await this.getAllAccounts(match).then(
                    result => {
                        return result;
                    }
                )
            }),
            tap(() => this.loading = false)
        )
    public formatterAccounts = (x: Account) => { return x.description; };

    constructor(
        public _transactionService: TransactionService,
        public _transactionTypeService: TransactionTypeService,
        public _companyService: CompanyService,
        public _employeeService: EmployeeService,
        public _accountService: AccountService,
        public _movementOfCancellationService: MovementOfCancellationService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
        public _cashBoxService: CashBoxService,
        public _userService: UserService,
        public _cancellationTypeService: CancellationTypeService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
    ) {
        this.transaction = new Transaction();
        this.transactionDate = this.transaction.startDate;
        this.movementsOfCancellations = new Array();
    }

    async ngOnInit() {

        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.posType = pathLocation[2].split('?')[0];
        this.buildForm();

        if (this.transactionId) {
            await this.getTransaction(this.transactionId).then(
                async transaction => {
                    if (transaction) {
                        this.transaction = transaction;
                        this.taxes = this.transaction.taxes;
                        this.getCancellationTypes();
                        if (this.transaction.endDate) {
                            this.transactionDate = this.transaction.endDate;
                        } else {
                            this.transactionDate = this.transaction.startDate;
                        }
                        this.transactionMovement = this.transaction.type.transactionMovement.toString();
                        this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
                        this.transaction.balance = this.roundNumber.transform(this.transaction.balance);
                        if (this.transaction.company) {
                            this.companyName = this.transaction.company.name;
                        }
                        this.setValuesForm();
                        if (this.transaction.type.requestEmployee) {
                            this.getEmployees('where="type":"' + this.transaction.type.requestEmployee._id + '"');
                        }
                        this.getCancellationsOfMovements()
                    }
                }
            );
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.transactionForm = this._fb.group({
            'company': [this.companyName, [Validators.required]],
            'date': [moment(this.transactionDate).format('YYYY-MM-DD'), [Validators.required]],
            'letter': [this.transaction.letter, []],
            'origin': [this.transaction.origin, []],
            'number': [this.transaction.number, [Validators.required]],
            'basePrice': [this.transaction.basePrice, []],
            'exempt': [this.transaction.exempt, []],
            'totalPrice': [this.transaction.totalPrice, [Validators.required]],
            'account': [this.transaction.account, []],
            'observation': [this.transaction.observation, []],
            'employeeOpening': [this.transaction.employeeOpening, []],
            'state': [this.transaction.state, []],
            'VATPeriod': [this.transaction.VATPeriod, []],
            'balance': [this.transaction.balance, []]
        });

        this.transactionForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public setValuesForm(): void {

        if (!this.transaction.origin) this.transaction.origin = 0;
        if (!this.transaction.letter) this.transaction.letter = "";
        if (!this.transaction.number) this.transaction.number = 1;
        if (!this.transaction.observation) this.transaction.observation = '';

        let employeeOpening;
        if (!this.transaction.employeeOpening) {
            employeeOpening = null;
        } else {
            if (this.transaction.employeeOpening._id) {
                employeeOpening = this.transaction.employeeOpening._id;
            } else {
                employeeOpening = this.transaction.employeeOpening;
            }
        }

        if (this.transaction.company) {
            this.companyName = this.transaction.company.name;
        }

        this.transactionForm.setValue({
            'company': this.companyName,
            'date': moment(this.transactionDate).format('YYYY-MM-DD'),
            'origin': (this.transaction.origin) ? this.transaction.origin : 0,
            'letter': this.transaction.letter,
            'number': (this.transaction.number) ? this.transaction.number : 0,
            'basePrice': (this.transaction.basePrice) ? this.transaction.basePrice : 0,
            'exempt': (this.transaction.exempt) ? this.transaction.exempt : 0,
            'totalPrice': (this.transaction.totalPrice) ? this.transaction.totalPrice : 0,
            'observation': this.transaction.observation,
            'employeeOpening': employeeOpening,
            'state': this.transaction.state,
            'VATPeriod': this.transaction.VATPeriod,
            'balance': (this.transaction.balance) ? this.transaction.balance : 0,
            'account': (this.transaction.account) ? this.transaction.account : null
        });
    }

    public onValueChanged(data?: any): void {

        if (!this.transactionForm) { return; }
        const form = this.transactionForm;

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

    public loadVATPeriod() {
        var vatPeriod = moment(this.transactionForm.value.date).format('YYYYMM')
        this.transactionForm.patchValue({ 'VATPeriod': vatPeriod });
    }

    public getCancellationTypes(): void {

        this.loading = true;

        this._cancellationTypeService.getCancellationTypes(
            { "destination._id": 1, "operationType": 1 }, // PROJECT
            { "destination._id": { $oid: this.transaction.type._id }, "operationType": { "$ne": "D" } }, // MATCH
            { order: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(result => {
            if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
                if (!this.transaction.type.requestArticles) {
                    this.showButtonCancelation = true;
                }
            } else {
                this.showButtonCancelation = false;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.showButtonCancelation = false;
                this.loading = false;
            });
    }

    public changeCompany(): void {
        if (this.transaction._id && this.transaction._id !== '') {
            this.openModal('change-company');
        } else {
            this.activeModal.close('change-company');
        }
    }

    public validateBalance() {
        if (this.transactionForm.value.balance > this.transaction.totalPrice) {
            this.showMessage("El saldo no puede ser mayor a: $" + this.transaction.totalPrice, 'danger', false);
            this.setValuesForm();
        }
    }

    public getCancellationsOfMovements() {

        this.loading = true;

        let match = { $or: [{ "transactionOrigin": { $oid: this.transaction._id }, "operationType": { "$ne": "D" } }, { "transactionDestination": { $oid: this.transaction._id }, "operationType": { "$ne": "D" } }] };


        // CAMPOS A TRAER
        let project = {
            "transactionOrigin": 1,
            "transactionDestination": 1,
            "operationType": 1
        };

        this._movementOfCancellationService.getMovementsOfCancellations(
            project, // PROJECT
            match, // MATCH
            { order: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(async result => {
            if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
                this.existsCancellations = true;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    async openModal(op: string) {

        let modalRef;

        switch (op) {
            case 'list-cancellations':
                modalRef = this._modalService.open(MovementOfCancellationComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionDestinationId = this.transaction._id;
                if (this.transaction.state === TransactionState.Closed) {
                    modalRef.componentInstance.totalPrice = this.transaction.balance;
                } else {
                    modalRef.componentInstance.totalPrice = this.transactionForm.value.totalPrice;
                }
                modalRef.componentInstance.selectionView = true;
                modalRef.componentInstance.movementsOfCancellations = this.movementsOfCancellations;
                modalRef.result.then(async (result) => {
                    if (result) {
                        this.movementsOfCashes = result.movementsOfCashes;
                        if (result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
                            this.movementsOfCancellations = result.movementsOfCancellations;
                            this.balanceTotal = 0;
                            for (let mov of this.movementsOfCancellations) {
                                let transOrigin: Transaction = await this.getTransaction(mov.transactionOrigin._id);
                                if ((transOrigin.type.transactionMovement === TransactionMovement.Sale &&
                                    transOrigin.type.movement === Movements.Outflows) ||
                                    (transOrigin.type.transactionMovement === TransactionMovement.Purchase &&
                                        transOrigin.type.movement === Movements.Inflows)) {
                                    if (mov.balance > 0) {
                                        this.balanceTotal -= mov.balance;
                                    } else {
                                        this.balanceTotal += mov.balance;
                                    }
                                } else {
                                    this.balanceTotal += mov.balance;
                                }
                            }
                            this.balanceTotal = this.roundNumber.transform(this.balanceTotal);
                            if (this.transaction.state == TransactionState.Open) {
                                this.transaction.totalPrice = this.balanceTotal;
                            }
                            this.transaction.balance = this.roundNumber.transform(this.transaction.totalPrice - this.balanceTotal);
                            this.setValuesForm();
                        }
                    }
                }, (reason) => {
                });
                break;
            case 'change-company':
                modalRef = this._modalService.open(SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
                if (this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
                    modalRef.componentInstance.type = CompanyType.Provider;
                } else if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                    modalRef.componentInstance.type = CompanyType.Client;
                }
                modalRef.result.then(
                    async (result) => {
                        if (result.company) {
                            this.transaction.company = result.company;
                            this.companyName = this.transaction.company.name;
                            this.transaction = await this.updateTransaction();
                            this.setValuesForm();
                        }
                    }, (reason) => {

                    }
                );
                break;
            default:
                break;
        }
    }

    public getTransaction(transactionId: string): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            this.loading = true;

            this._transactionService.getTransaction(transactionId).subscribe(
                async result => {
                    this.loading = false;
                    if (!result.transaction) {
                        this.showMessage(result.message, 'danger', false);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    async finishTransaction() {
        try {
            if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {

                await this.daleteMovementsOfCancellations('{"transactionDestination":"' + this.transaction._id + '"}');
                await this.saveMovementsOfCancellations(this.movementsOfCancellations);
            }
            if (this.transaction.state === TransactionState.Closed && this.balanceTotal !== -1) {

                let result: Resulteable = await this._transactionService.updateBalance(this.transaction).toPromise();
                if (result.status !== 200) throw result;
                this.transaction.balance = result.result.balance;
            }
            this.transaction = await this.updateTransaction()

            this.activeModal.close({ transaction: this.transaction, movementsOfCashes: this.movementsOfCashes });
        } catch (error) {

            this.showToast(error);
        }
    }

    public getEmployees(query: string): void {

        this.loading = true;

        this._employeeService.getEmployees(query).subscribe(
            result => {
                if (!result.employees) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.employees = result.employees;
                    this.setValuesForm();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }
    async getTransactions(): Promise<boolean> {
        let match = {
            "operationType": { "$ne": "D" },
            "type": {"$oid": this.transaction.type._id},
            "letter": this.transactionForm.value.letter,
            "number": this.transactionForm.value.number,
            "origin": this.transactionForm.value.origin
        };
        // CAMPOS A TRAER
        let project = {
            "origin": 1,
            "letter": 1,
            "number": 1,
            "type": 1,
            "operationType": 1
        };
        return new Promise((resolve, reject) => {
            this._transactionService.getTransactionsV2(project, match, {}, {}, 1, 0).subscribe(
                async r => {
                    if(r.transactions.length > 0){
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                }
            )
        })
 
    }
    async addTransaction() {

        this.transaction.observation = this.transactionForm.value.observation;
        this.transaction.balance = this.transactionForm.value.balance;
        this.transaction.employeeOpening = this.transactionForm.value.employeeOpening;
        this.transaction.employeeClosing = this.transactionForm.value.employeeOpening;
        this.transaction.account = this.transactionForm.value.account;

        if ((this.transaction.type.requestEmployee &&
            this.transaction.employeeOpening) ||
            !this.transaction.type.requestEmployee) {

            this.transaction.startDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
            this.transaction.endDate = this.datePipe.transform(this.transactionForm.value.date + " " + moment().format('HH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ', 'YYYY-MM-DD HH:mm:ss');
            this.transaction.VATPeriod = this.transactionForm.value.VATPeriod;
            this.transaction.expirationDate = this.transaction.endDate;
            this.transaction.origin = this.transactionForm.value.origin;
            this.transaction.letter = this.transactionForm.value.letter;
            this.transaction.number = this.transactionForm.value.number;
            this.transaction.basePrice = this.transactionForm.value.basePrice;
            this.transaction.totalPrice = this.transactionForm.value.totalPrice;

            if (this.balanceTotal <= this.transaction.totalPrice) {
                if (this.transaction.type.requestArticles ||
                    (this.transaction.totalPrice > 0 &&
                        !this.transaction.type.requestArticles) ||
                    (this.transaction.totalPrice === 0 &&
                        !this.transaction.type.requestArticles &&
                        this.transaction.type.allowZero)) {
                    if (this.transactionForm.value.state) {
                        this.transaction.state = this.transactionForm.value.state;
                    }

                    const existsTransaction = await this.getTransactions()
                    if(!existsTransaction){
                        this.finishTransaction();
                    }else{
                        this.showMessage('La transacción \"' + this.transactionForm.value.origin + '-' + this.transactionForm.value.letter + '-' + this.transactionForm.value.number + '\" ya existe', 'danger', false);
                    }
                } else {
                    this.showMessage("El importe total ingresado debe ser mayor a 0.", "info", true);
                }
            } else {
                this.showMessage("El monto de la transacción no puede ser menor a la suma de las transacciones canceladas.", "info", true);
            }
        } else {
            this.showMessage("Debe asignar el empleado " + this.transaction.type.requestEmployee.description, "info", true);
        }
    }

    public addTransactionTaxes(taxes: Taxes[]): void {
        this.taxes = taxes;
        this.updatePrices("taxes");
    }

    public updatePrices(op: string): void {
        this.updateTaxes(op);
        this.transaction.basePrice = this.roundNumber.transform(this.transactionForm.value.basePrice);
        this.transaction.exempt = this.roundNumber.transform(this.transactionForm.value.exempt);
        this.transaction.totalPrice = this.roundNumber.transform(this.transactionForm.value.totalPrice);
        this.transaction.origin = this.transactionForm.value.origin;
        if (this.transactionMovement && (this.transactionMovement !== TransactionMovement.Sale.toString())) {
            this.transaction.letter = this.transactionForm.value.letter;
            this.transaction.number = this.transactionForm.value.number;
        }

        this.transactionDate = this.transactionForm.value.date;

        this.transaction.observation = this.transactionForm.value.observation;
        this.setValuesForm();
    }

    public updateTaxes(op?: string): void {

        let transactionTaxes: Taxes[] = new Array();

        if (op !== 'totalPrice') {
            this.transactionForm.value.totalPrice = this.transactionForm.value.basePrice;

            if (this.transactionForm.value.exempt > 0) {
                this.transactionForm.value.totalPrice += this.transactionForm.value.exempt;
            }

            if (this.taxes && this.taxes.length > 0) {
                for (let taxesAux of this.taxes) {
                    let transactionTax: Taxes = new Taxes();
                    transactionTax.tax = taxesAux.tax;
                    transactionTax.taxBase = 0;
                    transactionTax.percentage = 0;
                    if (taxesAux.tax.taxBase == TaxBase.Neto) {
                        transactionTax.percentage = taxesAux.percentage;
                        transactionTax.taxBase = this.transaction.basePrice;
                        transactionTax.taxAmount = this.roundNumber.transform((transactionTax.taxBase * transactionTax.percentage / 100));
                    } else {
                        transactionTax.taxAmount = taxesAux.taxAmount;
                    }
                    this.transactionForm.value.totalPrice += transactionTax.taxAmount;
                    transactionTaxes.push(transactionTax);
                }
            }
            this.transaction.taxes = transactionTaxes;
        }
    }

    public updateTransaction(): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.updateTransaction(this.transaction).subscribe(
                result => {
                    if (!result.transaction) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Promise<MovementOfCancellation[]> {
        return new Promise<MovementOfCancellation[]>((resolve, reject) => {
            this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(
                async result => {
                    if (!result.movementsOfCancellations) {
                        if (result.message && result.message !== '')
                            reject(result.message);
                    } else {
                        resolve(result.movementsOfCancellations);
                    }
                },
                error => reject(error)
            );
        });
    }

    public daleteMovementsOfCancellations(query: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(
                async result => {
                    if (!result.movementsOfCancellations) {
                        if (result.message && result.message !== '')
                            reject(result.message);
                    } else {
                        resolve(result.movementsOfCancellations);
                    }
                },
                error => reject(error)
            );
        });
    }

    public getAllAccounts(match: {}): Promise<Account[]> {
        return new Promise<Account[]>((resolve, reject) => {
            this._accountService.getAll({
                match,
                sort: { description: 1 },
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            );
        });
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }

    public showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
            if (result.status === 0) {
                type = 'info';
                title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
            } else if (result.status === 200) {
                type = 'success';
                title = result.message;
            } else if (result.status >= 500) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            } else {
                type = 'info';
                title = (result.error && result.error.message) ? result.error.message : result.message;
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

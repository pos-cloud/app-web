import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { Company, CompanyType, GenderType } from '../company';
import { VATCondition } from 'app/components/vat-condition/vat-condition';
import { CompanyGroup } from 'app/components/company-group/company-group';
import { CompanyFields } from '../company-fields';

//Terceros
import * as moment from 'moment';

//SERVICE
import { CompanyService } from '../company.service';
import { VATConditionService } from '../../vat-condition/vat-condition.service';
import { CompanyGroupService } from "../../company-group/company-group.service";
import { EmployeeService } from "../../employee/employee.service";

//PIPE
import { DateFormatPipe } from '../../../main/pipes/date-format.pipe';
import { IdentificationType } from 'app/components/identification-type/identification-type';
import { IdentificationTypeService } from 'app/components/identification-type/identification-type.service';
import { ConfigService } from 'app/components/config/config.service';
import { StateService } from 'app/components/state/state.service';
import { State } from 'app/components/state/state';
import { CountryService } from 'app/components/country/country.service';
import { TransportService } from 'app/components/transport/transport.service';
import { Transport } from 'app/components/transport/transport';
import { PriceList } from 'app/components/price-list/price-list';
import { PriceListService } from 'app/components/price-list/price-list.service';
import { Employee } from 'app/components/employee/employee';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { AccountService } from 'app/components/account/account.service';
import { Account } from 'app/components/account/account';
import { AddressService } from 'app/components/address/address.service';
import { Address } from 'app/components/address/address.model';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-add-company',
    templateUrl: './add-company.component.html',
    styleUrls: ['./add-company.component.css'],
    providers: [NgbAlertConfig, TranslateMePipe]
})

export class AddCompanyComponent implements OnInit {

    public company: Company;
    @Input() companyId: string;
    @Input() companyType: CompanyType;
    @Input() operation: string;
    @Input() readonly: boolean;
    public config: Config;
    public types: CompanyType[];
    public vatConditions: VATCondition[];
    public companiesGroups: CompanyGroup[];
    public employees: Employee[];
    public states: State[];
    public otherFields: CompanyFields[] = new Array();
    public dateFormat = new DateFormatPipe();
    public identificationTypes: IdentificationType[];
    public companyForm: FormGroup;
    public alertMessage: string = '';
    public genders: any[] = ['', GenderType.Male, GenderType.Female];
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public countries: any;
    public transports: Transport;
    public priceLists: PriceList[];
    public orientation: string = 'horizontal';
    private subscription: Subscription = new Subscription();
    public address: Address[];

    public formErrors = {
        'code': '',
        'name': '',
        'fantasyName': '',
        'type': '',
        'vatCondition': '',
        'identificationType': '',
        'identificationValue': '',
        'address': '',
        'city': '',
        'phones': '',
        'emails': '',
        'gender': '',
        'birthday': '',
        'observation': '',
        'allowCurrentAccount': '',
        'group': '',
        'employee': '',
        'country': '',
        'floorNumber': '',
        'addressNumber': '',
        'state': '',
    };

    public validationMessages = {
        'code': {
            'required': 'Este campo es requerido.'
        },
        'name': {
            'required': 'Este campo es requerido.'
        },
        'fantasyName': {
        },
        'type': {
            'required': 'Este campo es requerido.'
        },
        'vatCondition': {
            'required': 'Este campo es requerido.'
        },
        'address': {
        },
        'city': {
        },
        'phones': {
        },
        'emails': {
        },
        'birthday': {
            'dateValid': ' Ingrese en formato DD/MM/AAAA'
        },
        'gender': {
        },
        'observation': {},
        'allowCurrentAccount': {},
        'group': {},
        'employee': {},
        'country': {},
        'addressNumber': {},
        'floorNumber': {},
        'state': {},
    };

    public searchAccounts = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' }, mode: "Analitico", operationType: { "$ne": "D" } } : {};
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
        public _companyService: CompanyService,
        public _vatConditionService: VATConditionService,
        public _companyGroupService: CompanyGroupService,
        public _addressService: AddressService,
        public _employeeService: EmployeeService,
        public _stateService: StateService,
        public _configService: ConfigService,
        public _identificationTypeService: IdentificationTypeService,
        public _accountService: AccountService,
        public _countryService: CountryService,
        public _transportService: TransportService,
        public _priceListService: PriceListService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        private _toastr: ToastrService,
        public translatePipe: TranslateMePipe
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.company = new Company();
        this.types = new Array();
        this.vatConditions = new Array();
        this.getVATConditions();
        this.getIdentificationTypes();
        this.getCompaniesGroups();
        this.getEmployees();
        this.getCountries();
        this.getTransports();
        this.getPriceLists();
    }

    async ngOnInit() {

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];

        if (pathLocation[2] === "clientes" ||
            this.companyType && this.companyType === CompanyType.Client) {
            this.types.push(CompanyType.Client);
            this.company.type = CompanyType.Client;
        } else if (pathLocation[2] === "proveedores" ||
            this.companyType && this.companyType === CompanyType.Provider) {
            this.types.push(CompanyType.Provider);
            this.company.type = CompanyType.Provider;
        } else if (pathLocation[3] === 'compra') {
            this.types.push(CompanyType.Provider);
            this.company.type = CompanyType.Provider;
        } else {
            this.types.push(CompanyType.Client);
            this.types.push(CompanyType.Provider);
            this.company.type = CompanyType.Client;
        }

        this.buildForm();

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
                if (this.company.type === CompanyType.Client) {
                    this.company.allowCurrentAccount = this.config.company.allowCurrentAccountClient.default;
                } else if (this.company.type === CompanyType.Provider) {
                    this.company.allowCurrentAccount = this.config.company.allowCurrentAccountProvider.default;
                }
                this.company.vatCondition = this.config.company.vatCondition.default;
                if (this.company.type === CompanyType.Client) this.company.account = this.config.company.accountClient.default;
                if (this.company.type === CompanyType.Provider) this.company.account = this.config.company.accountProvider.default;
            }
        );

        if (this.companyId) {
            this.getCompany();
        } else {
            this.getLastCompany();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public addCompanyFields(otherFields: CompanyFields[]): void {
        this.otherFields = otherFields;
    }

    public getCompany(): void {

        this.loading = true;

        this._companyService.getCompany(this.companyId).subscribe(
            result => {
                if (!result.company) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.company = result.company;
                    this.getCountries();

                    this.otherFields = this.company.otherFields;

                    if (this.company.birthday) {
                        this.company.birthday = moment(this.company.birthday, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
                    } else {
                        this.company.birthday = null;
                    }
                    this.getAddress();
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

    public getIdentificationTypes(): void {

        this.loading = true;

        let query = 'sort="name":1';

        this._identificationTypeService.getIdentificationTypes(query).subscribe(
            result => {
                if (!result.identificationTypes) {
                    this.loading = false;
                    this.identificationTypes = new Array();
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.identificationTypes = result.identificationTypes;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getEmployees(): void {

        this.loading = true;

        this._employeeService.getEmployees().subscribe(
            result => {
                if (!result.employees) {
                    this.employees = null;
                } else {
                    this.employees = result.employees;
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getStates(): void {

        this.loading = true;

        let match;
        if (this.companyForm.value.country) {
            match = { "country._id": { $oid: this.companyForm.value.country }, operationType: { $ne: "D" } };
        } else if (this.company.state) {
            match = { "country._id": { $oid: this.company.state._id }, operationType: { $ne: "D" } };
        }

        let project = {
            name: 1,
            operationType: 1,
            "country._id": 1
        };

        this._stateService.getStates(
            project, // PROJECT
            match, // MATCH
            { name: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result.states) {
                    this.states = result.states;
                } else {
                    this.states = new Array();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getCompaniesGroups(): void {
        this.loading = true;

        this._companyGroupService.getCompaniesGroups().subscribe(
            result => {
                if (!result.companiesGroups) {
                } else {
                    this.companiesGroups = result.companiesGroups;
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public buildForm(): void {

        this.companyForm = this._fb.group({
            '_id': [this.company._id, [
            ]
            ],
            'name': [this.company.name, [
                Validators.required
            ]
            ],
            'fantasyName': [this.company.fantasyName, [
            ]
            ],
            'type': [this.company.type, [
                Validators.required
            ]
            ],
            'vatCondition': [this.company.vatCondition, [
                Validators.required
            ]
            ],
            'identificationType': [this.company.identificationType, [
            ]
            ],
            'identificationValue': [this.company.identificationValue, [
            ]
            ],
            'grossIncome': [this.company.grossIncome, [
            ]
            ],
            'address': [this.company.address, [
            ]
            ],
            'city': [this.company.city, [
            ]
            ],
            'phones': [this.company.phones, [
            ]
            ],
            'emails': [this.company.emails, [
            ]
            ],
            'birthday': [null, [
            ]
            ],
            'gender': [this.company.gender, [
            ]
            ],
            'observation': [this.company.observation, []],
            'allowCurrentAccount': [this.company.allowCurrentAccount, []],
            'group': [this.company.group, []],
            'employee': [this.company.employee, []],
            'country': [this.company.country, []],
            'floorNumber': [this.company.floorNumber, []],
            'flat': [this.company.flat, []],
            'state': [this.company.state, []],
            'addressNumber': [this.company.addressNumber, []],
            'transport': [this.company.transport, []],
            'priceList': [this.company.priceList, []],
            'discount': [this.company.discount, []],
            'account': [this.company.account, []],
            'creditLimit': [this.company.creditLimit, []],
            'zipCode': [this.company.zipCode, []]
        });

        this.companyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {

        if (!this.companyForm) { return; }
        const form = this.companyForm;

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

    public setValueForm(): void {

        if (!this.company._id) this.company._id = '';
        if (!this.company.code) this.company.code = 1;
        if (!this.company.name) this.company.name = '';
        if (!this.company.fantasyName) this.company.fantasyName = '';
        if (!this.company.type) CompanyType.Client;
        if (!this.company.addressNumber) this.company.addressNumber = '';
        if (!this.company.floorNumber) this.company.floorNumber = '';
        if (!this.company.flat) this.company.flat = '';
        if (!this.company.address) this.company.address = '';
        if (!this.company.city) this.company.city = '';
        if (!this.company.phones) this.company.phones = '';
        if (!this.company.emails) this.company.emails = '';
        if (!this.company.identificationValue) this.company.identificationValue = '';
        if (this.company.birthday) {
            this.company.birthday = moment(this.company.birthday).format('YYYY-MM-DD');
        } else {
            this.company.birthday = null;
        }
        if (!this.company.gender && this.genders.length > 0) this.company.gender = null;
        if (!this.company.gender) this.company.gender = null;

        let vatCondition;
        if (!this.company.vatCondition) {
            vatCondition = null;
        } else {
            if (this.company.vatCondition._id) {
                vatCondition = this.company.vatCondition._id;
            } else {
                vatCondition = this.company.vatCondition;
            }
        }

        if (!this.company.observation) this.company.observation = '';
        if (this.company.allowCurrentAccount === undefined) {
            if (this.company.type === CompanyType.Client) {
                this.company.allowCurrentAccount = false;
            } else {
                this.company.allowCurrentAccount = true;
            }
        }
        if (!this.company.grossIncome) this.company.grossIncome = '';

        let group;
        if (!this.company.group) {
            group = null;
        } else {
            if (this.company.group._id) {
                group = this.company.group._id;
            } else {
                group = this.company.group;
            }
        }

        let employee;
        if (!this.company.employee) {
            employee = null;
        } else {
            if (this.company.employee._id) {
                employee = this.company.employee._id;
            } else {
                employee = this.company.employee;
            }
        }

        let country;
        if (!this.company.country) {
            country = null;
        } else {
            if (this.company.country._id) {
                country = this.company.country._id;
            } else {
                country = this.company.country;
            }
        }

        let identificationType;
        if (!this.company.identificationType) {
            identificationType = null;
        } else {
            if (this.company.identificationType._id) {
                identificationType = this.company.identificationType._id;
            } else {
                identificationType = this.company.identificationType;
            }
        }

        let state;
        if (!this.company.state) {
            state = null;
        } else {
            if (this.company.state._id) {
                state = this.company.state._id;
            } else {
                state = this.company.state;
            }
        }

        let transport;
        if (!this.company.transport) {
            transport = null;
        } else {
            if (this.company.transport._id) {
                transport = this.company.transport._id;
            } else {
                transport = this.company.transport;
            }
        }

        let priceList;
        if (!this.company.priceList) {
            priceList = null;
        } else {
            if (this.company.priceList._id) {
                priceList = this.company.priceList._id;
            } else {
                priceList = this.company.priceList;
            }
        }

        if (!this.company.discount) this.company.discount = 0;
        if (!this.company.account) this.company.account = null;
        if (!this.company.creditLimit) this.company.creditLimit = 0;
        if (!this.company.zipCode) this.company.zipCode = '';


        const values = {
            '_id': this.company._id,
            'name': this.company.name,
            'fantasyName': this.company.fantasyName,
            'type': this.company.type,
            'vatCondition': vatCondition,
            'identificationType': identificationType,
            'identificationValue': this.company.identificationValue,
            'grossIncome': this.company.grossIncome,
            'address': this.company.address,
            'city': this.company.city,
            'phones': this.company.phones,
            'emails': this.company.emails,
            'gender': this.company.gender,
            'birthday': this.company.birthday,
            'observation': this.company.observation,
            'allowCurrentAccount': this.company.allowCurrentAccount,
            'country': country,
            'addressNumber': this.company.addressNumber,
            'state': state,
            'floorNumber': this.company.floorNumber,
            'flat': this.company.flat,
            'group': group,
            'employee': employee,
            'transport': transport,
            'priceList': priceList,
            'discount': this.company.discount,
            'account': this.company.account,
            'creditLimit': this.company.creditLimit,
            'zipCode': this.company.zipCode
        };

        this.companyForm.setValue(values);
    }

    public getVATConditions(): void {

        this.loading = true;

        this._vatConditionService.getVATConditions().subscribe(
            result => {
                if (!result.vatConditions) {
                } else {
                    this.vatConditions = result.vatConditions;
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getLastCompany(): void {


        this.loading = true;

        let query = 'sort="code":-1&limit=1';

        this._companyService.getCompanies(query).subscribe(
            result => {
                let code = 1;
                if (result.companies) {
                    if (result.companies[0] !== undefined) {
                        code = result.companies[0].code + 1;
                    }
                }

                if (this.priceLists && this.priceLists.length > 0 && this.company.type === CompanyType.Client) {
                    this.priceLists.forEach(element => {
                        if (element.default) {
                            this.company.priceList = element
                        }
                    });
                }

                this.company.identificationType = this.identificationTypes[0];
                this.otherFields = this.company.otherFields;
                this.setValueForm();
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }


    public addCompany(): void {

        if (!this.readonly || this.operation === 'delete') {
            this.company = this.companyForm.value;

            this.company.otherFields = this.otherFields;

            if (this.company.birthday) {
                this.company.birthday = moment(this.company.birthday, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
            }
            if (this.isValid()) {
                this._companyService.setClients(null);
                this._companyService.setProviders(null);
                if (this.operation === 'add') {
                    this.saveCompany();
                } else if (this.operation === 'update') {
                    this.updateCompany();
                } else if (this.operation === 'delete') {
                    this.deleteObj();
                }
            }
        }
    }

    public isValid(): boolean {

        let valid: boolean = true;

        // if (this.identityTypeSelected === "" && this.company.vatCondition.description !== "Consumidor Final") {
        //   valid = false;
        //   this.showMessage("Al ingresar una condición de IVA distinta de Consumidor Final, debe ingresar el  de la empresa", "info", true);
        // }

        return valid;
    }

    public saveCompany(): void {

        this.loading = true;

        this._companyService.saveCompany(this.company).subscribe(
            result => {
                if (!result.company) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.company = result.company;
                    if (this.userType === 'pos') {
                        this.activeModal.close({ company: this.company });
                    } else {
                        this.showMessage("La empresa se ha añadido con éxito.", 'success', false);
                        this.company = new Company();
                        this.buildForm();
                        this.getLastCompany();
                    }
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updateCompany(): void {

        this.loading = true;

        this._companyService.updateCompany(this.company).subscribe(
            result => {
                if (!result.company) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.company = result.company;
                    this.showMessage("La empresa se ha actualizado con éxito.", 'success', false);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getCountries(): void {

        this.loading = true;

        // CAMPOS A TRAER
        let project = {
            name: 1,
            operationType: 1
        };

        this._countryService.getCountries(
            project, // PROJECT
            { operationType: { $ne: "D" } }, // MATCH
            { name: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(result => {
            this.loading = false;
            if (result && result.countries) {
                this.countries = result.countries;
                if (this.company.state) {
                    this.getStates();
                }
            }
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public getAllAccounts(match: {}): Promise<Account[]> {
        return new Promise<Account[]>((resolve, reject) => {
            this.subscription.add(this._accountService.getAll({
                match,
                sort: { description: 1 },
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public getPriceLists(): void {
        this.loading = true;

        // ORDENAMOS LA CONSULTA
        let sortAux = { name: 1 };

        // FILTRAMOS LA CONSULTA
        let match = { operationType: { $ne: "D" } };

        // CAMPOS A TRAER
        let project = {
            name: 1,
            default: 1,
            operationType: 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {};

        let limit = 0;

        let skip = 0;

        this._priceListService.getPriceListsV2(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(result => {
            if (result && result.priceLists) {
                this.priceLists = result.priceLists;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public getTransports(): void {
        this.loading = true;

        // ORDENAMOS LA CONSULTA
        let sortAux = { name: 1 };

        // FILTRAMOS LA CONSULTA
        let match = { operationType: { $ne: "D" } };

        // CAMPOS A TRAER
        let project = {
            name: 1,
            operationType: 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {};

        let limit = 0;

        let skip = 0;

        this._transportService.getTransports(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(result => {
            if (result && result.transports && result.transports.length > 0) {
                this.transports = result.transports;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public getAddress(): void {
        this.loading = true;

        this._addressService.getAll({
            match: {
                company: { $oid: this.company._id }
            } // SKIP
        }).subscribe(result => {
            if (result) {
                this.address = result.result
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public deleteObj() {
        this.loading = true;
        this.subscription.add(
            this._companyService.delete(this.company._id).subscribe(
                async result => {
                    this.showToast(result);
                    if (result.status === 200) this.activeModal.close({ company: this.company });
                },
                error => this.showToast(error)
            )
        );
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

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}

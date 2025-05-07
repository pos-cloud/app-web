import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AddressService } from '@core/services/address.service';
import { CompanyGroupService } from '@core/services/company-group.service';
import { CompanyService } from '@core/services/company.service';
import { ConfigService } from '@core/services/config.service';
import { CountryService } from '@core/services/country.service';
import { EmployeeService } from '@core/services/employee.service';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { PriceListService } from '@core/services/price-list.service';
import { StateService } from '@core/services/state.service';
import { TransportService } from '@core/services/transport.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import {
  Address,
  ApiResponse,
  CompanyGroup,
  CompanyType,
  Employee,
  GenderType,
  IdentificationType,
  PriceList,
  State,
  Transport,
  VATCondition,
} from '@types';
import { Config } from 'app/app.config';
import { Account } from 'app/components/account/account';
import { Company } from 'app/components/company/company';
import { AccountService } from 'app/core/services/account.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-companies',
  templateUrl: './company.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
  ],
})
export class CompanyComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public company: Company;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyForm: UntypedFormGroup;
  public accounts: Account[];
  private destroy$ = new Subject<void>();
  public config: Config;
  public vatConditions: VATCondition[];
  public companiesGroups: CompanyGroup[];
  public employees: Employee[];
  public states: State[];
  public address: Address[];
  public countries: any;
  public transports: Transport[];
  public priceLists: PriceList[];
  public identificationTypes: IdentificationType[];
  public type: string;
  public genders: any[] = ['', GenderType.Male, GenderType.Female];

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
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.companyForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z .0-9]+$')]],
      fantasyName: ['', []],
      code: ['', [Validators.required]],
      type: ['', [Validators.required]],
      vatCondition: ['', [Validators.required]],
      identificationType: ['', [Validators.required]],
      identificationValue: ['', [Validators.required]],
      grossIncome: ['', []],
      address: ['', []],
      city: ['', []],
      phones: ['', []],
      emails: ['', []],
      birthday: [null, []],
      gender: [null, []],
      observation: ['', []],
      allowCurrentAccount: ['', []],
      group: ['', []],
      employee: ['', []],
      country: ['', []],
      floorNumber: ['', []],
      flat: ['', []],
      state: ['', []],
      addressNumber: ['', []],
      transport: ['', []],
      priceList: ['', []],
      discount: [0, []],
      account: ['', []],
      creditLimit: ['', []],
      zipCode: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const companyId = pathUrl[5];
    this.operation = pathUrl[3];
    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.companyForm.disable();
    this.type = pathUrl[4];
    this.loading = true;

    combineLatest({
      vatConditions: this._vatConditionService.find({ query: { operationType: { $ne: 'D' } } }),
      companiesGroups: this._companyGroupService.find({ query: { operationType: { $ne: 'D' } } }),
      address: this._addressService.find({ query: { operationType: { $ne: 'D' } } }),
      employees: this._employeeService.find({ query: { operationType: { $ne: 'D' } } }),
      states: this._stateService.find({ query: { operationType: { $ne: 'D' } } }),
      countries: this._countryService.find({ query: { operationType: { $ne: 'D' } } }),
      transports: this._transportService.find({ query: { operationType: { $ne: 'D' } } }),
      priceLists: this._priceListService.find({ query: { operationType: { $ne: 'D' } } }),
      identificationTypes: this._identificationTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' }, mode: 'Analitico' } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({
          vatConditions,
          companiesGroups,
          address,
          employees,
          states,
          countries,
          transports,
          priceLists,
          identificationTypes,
          accounts,
        }) => {
          this.vatConditions = vatConditions ?? [];
          this.companiesGroups = companiesGroups ?? [];
          this.address = address ?? [];
          this.employees = employees ?? [];
          this.states = states ?? [];
          this.countries = countries ?? [];
          this.transports = transports ?? [];
          this.priceLists = priceLists ?? [];
          this.identificationTypes = identificationTypes ?? [];
          this.accounts = accounts ?? [];

          if (companyId) {
            if (companyId) this.getCompany(companyId);
          } else {
            this.setValueForm();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const pathUrl = this._router.url.split('/');
    let type = pathUrl[4] === 'client' ? CompanyType.Client : CompanyType.Provider;

    const vatCondition = this.vatConditions?.find((item) => item._id === this.company?.vatCondition?.toString());
    const identificationType = this.identificationTypes?.find(
      (item) => item._id === this.company?.identificationType?.toString()
    );
    const country = this.countries?.find((item) => item._id === this.company?.country?.toString());
    const group = this.companiesGroups?.find((item) => item._id === this.company?.group?.toString());
    const employee = this.employees?.find((item) => item._id === this.company?.employee?.toString());
    const transport = this.transports?.find((item) => item._id === this.company?.transport?.toString());
    const priceList = this.priceLists?.find((item) => item._id === this.company?.priceList?.toString());
    const state = this.states?.find((item) => item._id === this.company?.state?.toString());
    const account = this.accounts?.find((item) => item._id === this.company?.account?.toString());

    const values = {
      _id: this.company?._id ?? '',
      name: this.company?.name ?? '',
      code: this.company?.code ?? 0,
      fantasyName: this.company?.fantasyName ?? '',
      type: this.company?.type ?? type,
      vatCondition: vatCondition ?? null,
      identificationType: identificationType ?? null,
      identificationValue: this.company?.identificationValue ?? '',
      grossIncome: this.company?.grossIncome ?? '',
      address: this.company?.address ?? '',
      city: this.company?.city ?? '',
      phones: this.company?.phones ?? '',
      emails: this.company?.emails ?? '',
      gender: this.company?.gender ?? null,
      birthday: this.company?.birthday ? new Date(this.company.birthday).toISOString().substring(0, 10) : '',
      observation: this.company?.observation ?? '',
      allowCurrentAccount: this.company?.allowCurrentAccount ?? false,
      country: country ?? null,
      addressNumber: this.company?.addressNumber ?? '',
      state: state ?? null,
      floorNumber: this.company?.floorNumber ?? '',
      flat: this.company?.flat ?? '',
      group: group ?? null,
      employee: employee ?? null,
      transport: transport ?? null,
      priceList: priceList ?? null,
      discount: this.company?.discount ?? 0,
      account: account ?? null,
      creditLimit: this.company?.creditLimit ?? '',
      zipCode: this.company?.zipCode ?? '',
    };
    this.companyForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate([`/entities/companies/${this.type}`]);
  }

  public getCompany(id: string) {
    this.loading = true;

    this._companyService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.company = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleCompanyOperation() {
    this.loading = true;
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) {
      this.loading = false;
      return;
    }
    this.company = this.companyForm.value;
    switch (this.operation) {
      case 'add':
        this.saveCompany();
        break;
      case 'update':
        this.updateCompany();
        break;
      case 'delete':
        this.deleteCompany();
      default:
        break;
    }
  }

  public updateCompany() {
    this._companyService
      .update(this.company)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveCompany() {
    this._companyService
      .save(this.company)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteCompany() {
    this._companyService
      .delete(this.company._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}

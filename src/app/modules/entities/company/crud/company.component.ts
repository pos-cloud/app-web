import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AddressService } from '@core/services/address.service';
import { ArticleService } from '@core/services/article.service';
import { CompanyGroupService } from '@core/services/company-group.service';
import { CompanyService } from '@core/services/company.service';
import { ConfigService } from '@core/services/config.service';
import { CountryService } from '@core/services/country.service';
import { EmployeeService } from '@core/services/employee.service';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { PriceListService } from '@core/services/price-list.service';
import { StateService } from '@core/services/state.service';
import { TransportService } from '@core/services/transport.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ApiResponse, Company, CompanyType, GenderType } from '@types';
import { Config } from 'app/app.config';
import { BusinessModel } from 'app/core/enums/business-model.enum';
import { AccountService } from 'app/core/services/account.service';
import { SearchableDropdownComponent } from 'app/shared/components/searchable-dropdown/searchable-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-companies',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    SearchableDropdownComponent,
    ProgressbarModule,
  ],
})
export class CompanyComponent implements OnInit {
  @Input() property: {
    companyId: string;
    operation: string;
    type: string;
  };
  public companyId: string;
  public operation: string;
  public company: Company;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public companyForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public config: Config;

  public type: string;
  public genders: any[] = ['', GenderType.Male, GenderType.Female];
  public BusinessModel = BusinessModel;

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
    public _articleService: ArticleService,
    public _paymentMethod: PaymentMethodService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
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
      subscription: this._fb.group({
        article: [null, []],
        paymentMethod: [null, []],
        active: [null, []],
      }),
      clientFile: this._fb.group({
        skinType: ['', []],
        phototype: ['', []],
        currentStatus: ['', []],
        mostAffectedZone: ['', []],
        sensitivity: ['', []],
        isPregnant: [false, []],

        useSunscreen: [false, []],
        dermatologicalProblems: ['', []],
        previousCosmeticTreatments: ['', []],
        smokes: [false, []],
        occupation: ['', []],
        stressLevel: ['', []],
        eatingHabits: ['', []],
        physicalActivity: ['', []],
        dailyWaterConsumption: ['', []],
        medicalHistory: ['', []],
        currentMedication: ['', []],
        previousSurgeries: ['', []],
        allergies: ['', []],
        treatmentGoals: ['', []],
      }),
    });
  }

  ngOnInit() {
    this._configService.getConfig.subscribe((config) => {
      this.config = config;
    });

    if (this.property) {
      this.operation = this.property.operation;
      this.companyId = this.property.companyId;
      this.type = this.property.type;
    } else {
      const URL = this._router.url.split('/');
      this.operation = URL[3];
      this.companyId = URL[5];
      this.type = URL[4];
    }
    if (this.operation === 'view' || this.operation === 'delete') this.companyForm.disable();
    this.loading = true;

    if (this.companyId) {
      if (this.companyId) this.getCompany(this.companyId);
    } else {
      this.setValueForm();
    }
  }

  private businessModelMatches(model: BusinessModel): boolean {
    const businessModel = this.config?.businessModel;
    if (typeof businessModel !== 'string') {
      return false;
    }

    return businessModel.trim().toLowerCase() === model;
  }

  public get showClientFile(): boolean {
    return this.businessModelMatches(BusinessModel.Estetica);
  }

  public get showSubscriptionSection(): boolean {
    return (
      this.businessModelMatches(BusinessModel.SuscripcionesYMembresias) ||
      this.businessModelMatches(BusinessModel.Asociacion)
    );
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

    const allowCurrentAccount =
      type === CompanyType.Client
        ? (this.config?.company?.allowCurrentAccountClient?.default ?? false)
        : (this.config?.company?.allowCurrentAccountProvider?.default ?? false);
    const values = {
      _id: this.company?._id ?? '',
      name: this.company?.name ?? '',
      code: this.company?.code ?? 0,
      fantasyName: this.company?.fantasyName ?? '',
      type: this.property ? this.type : (this.company?.type ?? type),
      vatCondition: this.company?.vatCondition ?? null,
      identificationType: this.company?.identificationType ?? null,
      identificationValue: this.company?.identificationValue ?? '',
      grossIncome: this.company?.grossIncome ?? '',
      address: this.company?.address ?? '',
      city: this.company?.city ?? '',
      phones: this.company?.phones ?? '',
      emails: this.company?.emails ?? '',
      gender: this.company?.gender ?? null,
      birthday: this.company?.birthday ? new Date(this.company.birthday).toISOString().substring(0, 10) : '',
      observation: this.company?.observation ?? '',
      allowCurrentAccount: this.company?.allowCurrentAccount ?? allowCurrentAccount,
      country: this.company?.country ?? '',
      addressNumber: this.company?.addressNumber ?? '',
      state: this.company?.state ?? '',
      floorNumber: this.company?.floorNumber ?? '',
      flat: this.company?.flat ?? '',
      group: this.company?.group ?? null,
      employee: this.company?.employee ?? null,
      transport: this.company?.transport ?? null,
      priceList: this.company?.priceList ?? null,
      discount: this.company?.discount ?? 0,
      account: this.company?.account ?? null,
      creditLimit: this.company?.creditLimit ?? '',
      zipCode: this.company?.zipCode ?? '',
      subscription: {
        article: this.company?.subscription?.article ?? null,
        paymentMethod: this.company?.subscription?.paymentMethod ?? null,
        active: this.company?.subscription?.active ?? false,
      },
      clientFile: {
        //Evaluaccion de la piel
        skinType: this.company?.clientFile?.skinType ?? '',
        phototype: this.company?.clientFile?.phototype ?? '',
        currentStatus: this.company?.clientFile?.currentStatus ?? '',
        mostAffectedZone: this.company?.clientFile?.mostAffectedZone ?? '',
        sensitivity: this.company?.clientFile?.sensitivity ?? '',

        // Historial de salud
        isPregnant: this.company?.clientFile?.isPregnant ?? false,
        dermatologicalProblems: this.company?.clientFile?.dermatologicalProblems ?? '',
        previousCosmeticTreatments: this.company?.clientFile?.previousCosmeticTreatments ?? '',
        useSunscreen: this.company?.clientFile?.useSunscreen ?? false,
        smokes: this.company?.clientFile?.smokes ?? false,
        occupation: this.company?.clientFile?.occupation ?? '',
        stressLevel: this.company?.clientFile?.stressLevel ?? '',
        eatingHabits: this.company?.clientFile?.eatingHabits ?? '',

        //Historia clínica estética
        physicalActivity: this.company?.clientFile?.physicalActivity ?? '',
        dailyWaterConsumption: this.company?.clientFile?.dailyWaterConsumption ?? '',
        medicalHistory: this.company?.clientFile?.medicalHistory ?? '',
        currentMedication: this.company?.clientFile?.currentMedication ?? '',
        previousSurgeries: this.company?.clientFile?.previousSurgeries ?? '',
        allergies: this.company?.clientFile?.allergies ?? '',
        treatmentGoals: this.company?.clientFile?.treatmentGoals ?? '',
      },
    };
    this.companyForm.setValue(values);
  }

  returnTo() {
    if (this.property) {
      this.activeModal.close({ company: this.company });
    } else {
      this._router.navigate([`/entities/companies/${this.type}`]);
    }
  }

  public getCompany(id: string) {
    this.loading = true;

    this._companyService
      .getCompanyObjById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.company = result.result[0];
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

  onEnter() {
    if (this.companyForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleCompanyOperation();
    }
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
          if (result.status == 200) {
            this.company = result.result;
            this.returnTo();
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

  public saveCompany() {
    this._companyService
      .save(this.company)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.company = result.result;
            this.returnTo();
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

import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { BranchService } from '@core/services/branch.service';
import { CashBoxTypeService } from '@core/services/cash-box-type.service';
import { CompanyService } from '@core/services/company.service';
import { CountryService } from '@core/services/country.service';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { StateService } from '@core/services/state.service';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import {
  ApiResponse,
  Branch,
  CashBoxType,
  Company,
  Country,
  CurrentAccount,
  DescriptionType,
  EntryAmount,
  IdentificationType,
  Movements,
  PriceType,
  State,
  TransactionType,
  VATCondition,
} from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-type',
  templateUrl: './transaction-type.component.html',
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
export class TransactionTypeComponent implements OnInit {
  public transactionTypeId: string;
  public operation: string;

  public transactionType: TransactionType;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public transactionTypeForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public vatConditions: VATCondition[];
  public states: State[];
  public countries: Country[];
  public identificationTypes: IdentificationType[];
  public branches: Branch[];
  public cashBoxTypes: CashBoxType[];
  public companies: Company[]; // Reemplazar 'any' con el tipo correcto de Company
  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _vatConditionService: VATConditionService,
    public _stateService: StateService,
    public _identificationTypeService: IdentificationTypeService,
    public _countryService: CountryService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _router: Router,
    public _branchService: BranchService,
    private _toastService: ToastService,
    private _cashBoxTypeService: CashBoxTypeService,
    private _companyService: CompanyService
  ) {
    this.transactionTypeForm = this._fb.group({
      _id: ['', []],
      order: [1, []],
      transactionMovement: ['', [Validators.required]],
      abbreviation: ['', []],
      name: ['', [Validators.required]],
      labelPrint: ['', []],
      currentAccount: ['', []],
      movement: ['', []],
      modifyStock: [false, []],
      stockMovement: ['', []],
      requestArticles: [false, []],
      modifyArticle: [false, []],
      entryAmount: [EntryAmount.SaleWithVAT, []],
      requestTaxes: [false, []],
      requestPaymentMethods: [true, []],
      paymentMethods: ['', []],
      showKeyboard: [false, []],
      defectOrders: [false, []],
      electronics: [false, []],
      codes: ['', []], // AR
      fiscalCode: ['', []],
      fixedOrigin: [0, []],
      fixedLetter: ['', []],
      maxOrderNumber: [0, []],
      showPrices: [true, []],
      printable: [false, []],
      defectPrinter: ['', []],
      defectUseOfCFDI: ['', []],
      tax: [false, []],
      cashBoxImpact: [true, []],
      cashOpening: [false, []],
      cashClosing: [false, []],
      allowAPP: [false, []],
      allowTransactionClose: [true, []],
      allowEdit: [false, []],
      allowDelete: [false, []],
      allowZero: [false, []],
      allowCompanyDiscount: [true, []],
      allowPriceList: [true, []],
      requestCurrency: [false, []],
      requestEmployee: ['', []],
      requestTransport: [false, []],
      fastPayment: ['', []],
      requestCompany: ['', []],
      isPreprinted: [false, []],
      automaticNumbering: [true, []],
      automaticCreation: [false, []],
      showPriceType: [PriceType.Final, []],
      showDescriptionType: [DescriptionType.Description, []],
      printDescriptionType: [DescriptionType.Description, []],
      printSign: [false, []],
      printBalanceAccount: [false, []],
      posKitchen: [false, []],
      readLayout: [false, []],
      updatePrice: ['', []],
      resetNumber: [false, []],
      updateArticle: [false, []],
      finishCharge: [true, []],
      requestEmailTemplate: [false, []],
      defectEmailTemplate: ['', []],
      requestShipmentMethod: [false, []],
      defectShipmentMethod: ['', []],
      application: ['', []],
      company: ['', []],
      branch: ['', []],
      level: [0, []],
      groupsArticles: [false, []],
      printOrigin: [false, []],
      printBalanceOnCanceled: [false, []],
      expirationDate: ['', []],
      numberPrint: [0, []],
      orderNumber: [0, []],
      resetOrderNumber: ['', []],
      allowAccounting: [false, []],
      finishState: ['', []],
      optionalAFIP: ['', []],
      cashBoxType: ['', []],
      creationUser: ['', []],
      creationDate: ['', []],
      updateUser: ['', []],
      updateDate: ['', []],
      isSubscription: [false, []],
      codeA: ['', []],
      codeB: ['', []],
      codeC: ['', []],
      codeD: ['', []],
      codeE: ['', []],
      codeM: ['', []],
      codeR: ['', []],
      codeZ: ['', []],
      codeT: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.transactionTypeId = pathUrl[4];
    this.operation = pathUrl[3];

    if (this.operation === 'view' || this.operation === 'delete') this.transactionTypeForm.disable();

    this.loading = true;

    combineLatest({
      branch: this._branchService.find({ query: { operationType: { $ne: 'D' } } }),
      cashBoxTypes: this._cashBoxTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      companies: this._companyService.find({ query: { operationType: { $ne: 'D' } } }),
      identificationTypes: this._identificationTypeService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ branch, cashBoxTypes, companies, identificationTypes }) => {
          this.branches = branch ?? [];
          this.cashBoxTypes = cashBoxTypes ?? [];
          this.companies = companies ?? [];
          this.identificationTypes = identificationTypes ?? [];

          if (this.transactionTypeId) {
            this.getTransactionTypes(this.transactionTypeId);
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
    // const vatCondition = this.vatConditions?.find((item) => item._id === this.transport?.vatCondition?.toString());
    // const identificationType = this.identificationTypes?.find(
    //   (item) => item._id === this.transport?.identificationType?.toString()
    // );
    // const country = this.countries?.find((item) => item._id === this.transport?.country?.toString());
    // const state = this.states?.find((item) => item._id === this.transport?.state?.toString());

    const values = {
      _id: this.transactionType?._id ?? '',
      order: this.transactionType?.order ?? 1,
      transactionMovement: this.transactionType?.transactionMovement ?? '',
      abbreviation: this.transactionType?.abbreviation ?? '',
      name: this.transactionType?.name ?? '',
      labelPrint: this.transactionType?.labelPrint ?? '',
      currentAccount: this.transactionType?.currentAccount ?? CurrentAccount.No,
      movement: this.transactionType?.movement ?? Movements.Inflows,
      modifyStock: this.transactionType?.modifyStock ?? false,
      stockMovement: this.transactionType?.stockMovement ?? '',
      requestArticles: this.transactionType?.requestArticles ?? false,
      modifyArticle: this.transactionType?.modifyArticle ?? false,
      entryAmount: this.transactionType?.entryAmount ?? EntryAmount.SaleWithVAT,
      requestTaxes: this.transactionType?.requestTaxes ?? false,
      requestPaymentMethods: this.transactionType?.requestPaymentMethods ?? true,
      paymentMethods: this.transactionType?.paymentMethods ?? '',
      showKeyboard: this.transactionType?.showKeyboard ?? false,
      defectOrders: this.transactionType?.defectOrders ?? false,
      electronics: this.transactionType?.electronics ?? false,
      codes: this.transactionType?.codes ?? 1, // AR
      fiscalCode: this.transactionType?.fiscalCode ?? '',
      fixedOrigin: this.transactionType?.fixedOrigin ?? 0,
      fixedLetter: this.transactionType?.fixedLetter ?? '',
      maxOrderNumber: this.transactionType?.maxOrderNumber ?? 0,
      showPrices: this.transactionType?.showPrices ?? true,
      printable: this.transactionType?.printable ?? false,
      defectPrinter: this.transactionType?.defectPrinter ?? '',
      defectUseOfCFDI: this.transactionType?.defectUseOfCFDI ?? '',
      tax: this.transactionType?.tax ?? false,
      cashBoxImpact: this.transactionType?.cashBoxImpact ?? true,
      cashOpening: this.transactionType?.cashOpening ?? false,
      cashClosing: this.transactionType?.cashClosing ?? false,
      allowAPP: this.transactionType?.allowAPP ?? false,
      allowTransactionClose: this.transactionType?.allowTransactionClose ?? true,
      allowEdit: this.transactionType?.allowEdit ?? false,
      allowDelete: this.transactionType?.allowDelete ?? false,
      allowZero: this.transactionType?.allowZero ?? false,
      allowCompanyDiscount: this.transactionType?.allowCompanyDiscount ?? true,
      allowPriceList: this.transactionType?.allowPriceList ?? true,
      requestCurrency: this.transactionType?.requestCurrency ?? false,
      requestEmployee: this.transactionType?.requestEmployee ?? '',
      requestTransport: this.transactionType?.requestTransport ?? false,
      fastPayment: this.transactionType?.fastPayment ?? '',
      requestCompany: this.transactionType?.requestCompany ?? '',
      isPreprinted: this.transactionType?.isPreprinted ?? false,
      automaticNumbering: this.transactionType?.automaticNumbering ?? true,
      automaticCreation: this.transactionType?.automaticCreation ?? false,
      showPriceType: this.transactionType?.showPriceType ?? PriceType.Final,
      showDescriptionType: this.transactionType?.showDescriptionType ?? DescriptionType.Description,
      printDescriptionType: this.transactionType?.printDescriptionType ?? DescriptionType.Description,
      printSign: this.transactionType?.printSign ?? false,
      printBalanceAccount: this.transactionType?.printBalanceAccount ?? false,
      posKitchen: this.transactionType?.posKitchen ?? false,
      readLayout: this.transactionType?.readLayout ?? false,
      updatePrice: this.transactionType?.updatePrice ?? '',
      resetNumber: this.transactionType?.resetNumber ?? false,
      updateArticle: this.transactionType?.updateArticle ?? false,
      finishCharge: this.transactionType?.finishCharge ?? true,
      requestEmailTemplate: this.transactionType?.requestEmailTemplate ?? false,
      defectEmailTemplate: this.transactionType?.defectEmailTemplate ?? '',
      requestShipmentMethod: this.transactionType?.requestShipmentMethod ?? false,
      defectShipmentMethod: this.transactionType?.defectShipmentMethod ?? '',
      application: this.transactionType?.application ?? '',
      company: this.transactionType?.company ?? '',
      branch: this.transactionType?.branch ?? '',
      level: this.transactionType?.level ?? 0,
      groupsArticles: this.transactionType?.groupsArticles ?? false,
      printOrigin: this.transactionType?.printOrigin ?? false,
      printBalanceOnCanceled: this.transactionType?.printBalanceOnCanceled ?? false,
      expirationDate: this.transactionType?.expirationDate ?? '',
      numberPrint: this.transactionType?.numberPrint ?? 0,
      orderNumber: this.transactionType?.orderNumber ?? 0,
      resetOrderNumber: this.transactionType?.resetOrderNumber ?? '',
      allowAccounting: this.transactionType?.allowAccounting ?? false,
      finishState: this.transactionType?.finishState ?? '',
      optionalAFIP: this.transactionType?.optionalAFIP ?? '',
      cashBoxType: this.transactionType?.cashBoxType ?? '',
      creationUser: this.transactionType?.creationUser ?? '',
      creationDate: this.transactionType?.creationDate ?? '',
      updateUser: this.transactionType?.updateUser ?? '',
      updateDate: this.transactionType?.updateDate ?? '',
      isSubscription: this.transactionType?.isSubscription ?? false,
    };
    this.transactionTypeForm.setValue(values);
  }

  returnTo() {
    this._router.navigate(['/entities/transaction-types']);
  }

  public getTransactionTypes(id: string) {
    this.loading = true;

    this._transactionTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.transactionType = result.result;
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

  public handleTransactionTypes() {
    this.loading = true;
    this.transactionTypeForm.markAllAsTouched();
    if (this.transactionTypeForm.invalid) {
      this.loading = false;
      return;
    }
    this.transactionType = this.transactionTypeForm.value;
    switch (this.operation) {
      case 'add':
        this.saveTransactionTypes();
        break;
      case 'update':
        this.updateTransactionTypes();
        break;
      case 'delete':
        this.deleteTransactionTypes();
      default:
        break;
    }
  }

  public updateTransactionTypes() {
    this._transactionTypeService
      .update(this.transactionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.transactionType = result.result;
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

  public saveTransactionTypes() {
    this._transactionTypeService
      .save(this.transactionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.transactionType = result.result;
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

  public deleteTransactionTypes() {
    this._transactionTypeService
      .delete(this.transactionType._id)
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

import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ApplicationService } from '@core/services/application.service';
import { BranchService } from '@core/services/branch.service';
import { CashBoxTypeService } from '@core/services/cash-box-type.service';
import { CompanyService } from '@core/services/company.service';
import { EmailTemplateService } from '@core/services/email-template.service';
import { EmployeeTypeService } from '@core/services/employee-type.service';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { PrinterService } from '@core/services/printer.service';
import { ShipmentMethodService } from '@core/services/shipment-method.service';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import {
  ApiResponse,
  Application,
  Branch,
  CashBoxType,
  Company,
  CompanyType,
  CurrentAccount,
  DescriptionType,
  EmailTemplate,
  EmployeeType,
  EntryAmount,
  Movements,
  OPTIONAL_AFIP,
  PaymentMethod,
  Printer,
  PriceType,
  ShipmentMethod,
  StockMovement,
  TransactionMovement,
  TransactionState,
  TransactionType,
  View,
} from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface OptionalAFIP {
  id: string;
  name: string;
  value?: string;
}

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
export class TransactionTypeComponent implements OnInit, OnDestroy {
  public operation: string;
  public transactionTypeId: string;
  public transactionType: TransactionType;
  public transactionTypeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  // Relational data for typeahead dropdowns
  public branches: Branch[] = [];
  public cashBoxTypes: CashBoxType[] = [];
  public companies: Company[] = [];
  public employeeTypes: EmployeeType[] = [];
  public applications: Application[] = [];
  public emailTemplates: EmailTemplate[] = [];
  public shipmentMethods: ShipmentMethod[] = [];
  public printers: Printer[] = [];
  public paymentMethods: PaymentMethod[] = [];
  public optionalAFIPList: OptionalAFIP[] = OPTIONAL_AFIP;

  // Enum options for selects.
  // TransactionMovement and CompanyType are declared with `<any>` casts in their
  // enums, which makes them generate reverse mappings. Listing the members
  // explicitly avoids duplicated entries in the dropdowns.
  public transactionMovements = [
    TransactionMovement.Sale,
    TransactionMovement.Purchase,
    TransactionMovement.Stock,
    TransactionMovement.Money,
    TransactionMovement.Production,
  ];
  public companyTypes = [CompanyType.Client, CompanyType.Provider];
  public transactionStates = Object.values(TransactionState);
  public currentAccounts = Object.values(CurrentAccount);
  public movements = Object.values(Movements);
  public stockMovements = Object.values(StockMovement);
  public entryAmounts = Object.values(EntryAmount);
  public priceTypes = Object.values(PriceType);
  public descriptionTypes = Object.values(DescriptionType);
  public views = Object.values(View);

  // Static options
  public readonly fixedLetters = ['X', 'A', 'B', 'C', 'D', 'E', 'M', 'R', 'T', 'Z'];
  public readonly resetOrderNumbers = ['Caja', 'Cantidad', 'Tiempo'];
  public readonly codeLetters = ['A', 'B', 'C', 'D', 'E', 'M', 'R', 'T', 'Z'];

  constructor(
    private _transactionTypeService: TransactionTypeService,
    private _branchService: BranchService,
    private _cashBoxTypeService: CashBoxTypeService,
    private _companyService: CompanyService,
    private _employeeTypeService: EmployeeTypeService,
    private _applicationService: ApplicationService,
    private _emailTemplateService: EmailTemplateService,
    private _shipmentMethodService: ShipmentMethodService,
    private _printerService: PrinterService,
    private _paymentMethodService: PaymentMethodService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    this.transactionTypeId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.transactionTypeForm.disable();

    this.loading = true;
    combineLatest({
      branches: this._branchService.find({ query: { operationType: { $ne: 'D' } } }),
      cashBoxTypes: this._cashBoxTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      companies: this._companyService.find({ query: { operationType: { $ne: 'D' } } }),
      employeeTypes: this._employeeTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      applications: this._applicationService.find({ query: { operationType: { $ne: 'D' } } }),
      emailTemplates: this._emailTemplateService.find({ query: { operationType: { $ne: 'D' } } }),
      shipmentMethods: this._shipmentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
      printers: this._printerService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this._paymentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.branches = data.branches ?? [];
          this.cashBoxTypes = data.cashBoxTypes ?? [];
          this.companies = data.companies ?? [];
          this.employeeTypes = data.employeeTypes ?? [];
          this.applications = data.applications ?? [];
          this.emailTemplates = data.emailTemplates ?? [];
          this.shipmentMethods = data.shipmentMethods ?? [];
          this.printers = data.printers ?? [];
          this.paymentMethods = data.paymentMethods ?? [];

          if (this.transactionTypeId) {
            this.getTransactionType(this.transactionTypeId);
          } else {
            this.setValueForm();
            this.loading = false;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  private buildForm(): void {
    this.transactionTypeForm = this._fb.group({
      _id: ['', []],
      // Datos principales
      order: [1, []],
      branch: [null, []],
      name: ['', [Validators.required]],
      abbreviation: ['', []],
      transactionMovement: [null, [Validators.required]],
      currentAccount: [CurrentAccount.No, []],
      movement: [Movements.Inflows, []],
      // Permisos
      level: [0, []],
      allowEdit: [false, []],
      allowDelete: [false, []],
      allowAPP: [false, []],
      allowTransactionClose: [true, []],
      application: [null, []],
      // Numeración
      electronics: [false, []],
      tax: [false, []],
      requestTaxes: [false, []],
      automaticNumbering: [true, []],
      fiscalCode: ['', []],
      defectUseOfCFDI: ['', []],
      fixedOrigin: [0, []],
      fixedLetter: ['X', []],
      expirationDate: ['', []],
      automaticCreation: [false, []],
      resetOrderNumber: [null, []],
      maxOrderNumber: [0, []],
      orderNumber: [0, []],
      cashBoxType: [null, []],
      optionalAFIP: [null, []],
      optionalAFIPValue: ['', []],
      codeA: ['', []],
      codeB: ['', []],
      codeC: ['', []],
      codeD: ['', []],
      codeE: ['', []],
      codeM: ['', []],
      codeR: ['', []],
      codeT: ['', []],
      codeZ: ['', []],
      // Personalizado
      requestCompany: [null, []],
      company: [null, []],
      allowCompanyDiscount: [true, []],
      allowPriceList: [true, []],
      requestEmployee: [null, []],
      requestCurrency: [false, []],
      defectOrders: [false, []],
      requestTransport: [false, []],
      finishState: [null, []],
      isSubscription: [false, []],
      view: [View.Fast, []],
      // Producto
      requestArticles: [false, []],
      modifyArticle: [false, []],
      showPrices: [true, []],
      showPriceType: [PriceType.Final, []],
      entryAmount: [EntryAmount.SaleWithVAT, []],
      showDescriptionType: [DescriptionType.Description, []],
      updatePrice: [null, []],
      updateArticle: [false, []],
      groupsArticles: [false, []],
      // Stock
      modifyStock: [false, []],
      stockMovement: [null, []],
      // Contabilidad
      allowAccounting: [false, []],
      // Fondos
      cashBoxImpact: [true, []],
      cashOpening: [false, []],
      cashClosing: [false, []],
      // Correo
      requestEmailTemplate: [false, []],
      defectEmailTemplate: [null, []],
      // Método de entrega
      requestShipmentMethod: [false, []],
      defectShipmentMethod: [null, []],
      // Impresión
      labelPrint: ['', []],
      defectPrinter: [null, []],
      isPreprinted: [false, []],
      printable: [false, []],
      readLayout: [false, []],
      printBalanceAccount: [false, []],
      printSign: [false, []],
      printOrigin: [false, []],
      printBalanceOnCanceled: [false, []],
      posKitchen: [false, []],
      printDescriptionType: [DescriptionType.Description, []],
      numberPrint: [0, []],
      // Método de pago
      requestPaymentMethods: [true, []],
      allowZero: [false, []],
      fastPayment: [null, []],
      finishCharge: [true, []],
      showKeyboard: [false, []],
      paymentMethods: [[], []],
    });
  }

  private findById<T extends { _id?: string }>(list: T[], value: any): T | null {
    if (!value) return null;
    const id = typeof value === 'object' ? value._id : value;
    return list.find((item) => item._id === id?.toString()) ?? null;
  }

  public setValueForm(): void {
    const tt = this.transactionType;

    const selectedPaymentMethods = (tt?.paymentMethods ?? [])
      .map((pm: any) => this.findById(this.paymentMethods, pm))
      .filter((pm): pm is PaymentMethod => pm !== null);

    const selectedOptionalAFIP = tt?.optionalAFIP?.id
      ? this.optionalAFIPList.find((item) => item.id === tt.optionalAFIP.id) ?? null
      : null;

    this.transactionTypeForm.patchValue({
      _id: tt?._id ?? '',
      order: tt?.order ?? 1,
      branch: this.findById(this.branches, tt?.branch),
      name: tt?.name ?? '',
      abbreviation: tt?.abbreviation ?? '',
      transactionMovement: tt?.transactionMovement ?? null,
      currentAccount: tt?.currentAccount ?? CurrentAccount.No,
      movement: tt?.movement ?? Movements.Inflows,
      level: tt?.level ?? 0,
      allowEdit: tt?.allowEdit ?? false,
      allowDelete: tt?.allowDelete ?? false,
      allowAPP: tt?.allowAPP ?? false,
      allowTransactionClose: tt?.allowTransactionClose ?? true,
      application: this.findById(this.applications, tt?.application),
      electronics: tt?.electronics ?? false,
      tax: tt?.tax ?? false,
      requestTaxes: tt?.requestTaxes ?? false,
      automaticNumbering: tt?.automaticNumbering ?? true,
      fiscalCode: tt?.fiscalCode ?? '',
      defectUseOfCFDI: tt?.defectUseOfCFDI ?? '',
      fixedOrigin: tt?.fixedOrigin ?? 0,
      fixedLetter: tt?.fixedLetter ?? 'X',
      expirationDate: tt?.expirationDate ? tt.expirationDate.substring(0, 10) : '',
      automaticCreation: tt?.automaticCreation ?? false,
      resetOrderNumber: tt?.resetOrderNumber ?? null,
      maxOrderNumber: tt?.maxOrderNumber ?? 0,
      orderNumber: tt?.orderNumber ?? 0,
      cashBoxType: this.findById(this.cashBoxTypes, tt?.cashBoxType),
      optionalAFIP: selectedOptionalAFIP,
      optionalAFIPValue: tt?.optionalAFIP?.value ?? '',
      requestCompany: tt?.requestCompany ?? null,
      company: this.findById(this.companies, tt?.company),
      allowCompanyDiscount: tt?.allowCompanyDiscount ?? true,
      allowPriceList: tt?.allowPriceList ?? true,
      requestEmployee: this.findById(this.employeeTypes, tt?.requestEmployee),
      requestCurrency: tt?.requestCurrency ?? false,
      defectOrders: tt?.defectOrders ?? false,
      requestTransport: tt?.requestTransport ?? false,
      finishState: tt?.finishState ?? null,
      isSubscription: tt?.isSubscription ?? false,
      view: tt?.view ?? View.Fast,
      requestArticles: tt?.requestArticles ?? false,
      modifyArticle: tt?.modifyArticle ?? false,
      showPrices: tt?.showPrices ?? true,
      showPriceType: tt?.showPriceType ?? PriceType.Final,
      entryAmount: tt?.entryAmount ?? EntryAmount.SaleWithVAT,
      showDescriptionType: tt?.showDescriptionType ?? DescriptionType.Description,
      updatePrice: tt?.updatePrice ?? null,
      updateArticle: tt?.updateArticle ?? false,
      groupsArticles: tt?.groupsArticles ?? false,
      modifyStock: tt?.modifyStock ?? false,
      stockMovement: tt?.stockMovement ?? null,
      allowAccounting: tt?.allowAccounting ?? false,
      cashBoxImpact: tt?.cashBoxImpact ?? true,
      cashOpening: tt?.cashOpening ?? false,
      cashClosing: tt?.cashClosing ?? false,
      requestEmailTemplate: tt?.requestEmailTemplate ?? false,
      defectEmailTemplate: this.findById(this.emailTemplates, tt?.defectEmailTemplate),
      requestShipmentMethod: tt?.requestShipmentMethod ?? false,
      defectShipmentMethod: this.findById(this.shipmentMethods, tt?.defectShipmentMethod),
      labelPrint: tt?.labelPrint ?? '',
      defectPrinter: this.findById(this.printers, tt?.defectPrinter),
      isPreprinted: tt?.isPreprinted ?? false,
      printable: tt?.printable ?? false,
      readLayout: tt?.readLayout ?? false,
      printBalanceAccount: tt?.printBalanceAccount ?? false,
      printSign: tt?.printSign ?? false,
      printOrigin: tt?.printOrigin ?? false,
      printBalanceOnCanceled: tt?.printBalanceOnCanceled ?? false,
      posKitchen: tt?.posKitchen ?? false,
      printDescriptionType: tt?.printDescriptionType ?? DescriptionType.Description,
      numberPrint: tt?.numberPrint ?? 0,
      requestPaymentMethods: tt?.requestPaymentMethods ?? true,
      allowZero: tt?.allowZero ?? false,
      fastPayment: this.findById(this.paymentMethods, tt?.fastPayment),
      finishCharge: tt?.finishCharge ?? true,
      showKeyboard: tt?.showKeyboard ?? false,
      paymentMethods: selectedPaymentMethods,
    });

    this.setCodesForm(tt?.codes ?? []);
  }

  private setCodesForm(codes: { letter: string; code: number }[]): void {
    codes.forEach((code) => {
      const control = `code${code.letter}`;
      if (this.transactionTypeForm.get(control)) {
        this.transactionTypeForm.get(control).setValue(code.code);
      }
    });
  }

  public isPaymentMethodSelected(paymentMethod: PaymentMethod): boolean {
    const selected: PaymentMethod[] = this.transactionTypeForm.get('paymentMethods').value ?? [];
    return selected.some((pm) => pm._id === paymentMethod._id);
  }

  public togglePaymentMethod(paymentMethod: PaymentMethod, checked: boolean): void {
    const control = this.transactionTypeForm.get('paymentMethods');
    const selected: PaymentMethod[] = control.value ?? [];
    if (checked) {
      control.setValue([...selected, paymentMethod]);
    } else {
      control.setValue(selected.filter((pm) => pm._id !== paymentMethod._id));
    }
  }

  private buildPayload(): TransactionType {
    const value = { ...this.transactionTypeForm.value };

    // Build AFIP codes array from the per-letter controls
    value.codes = this.codeLetters
      .map((letter) => ({ letter, code: value[`code${letter}`] }))
      .filter((entry) => entry.code !== null && entry.code !== '' && entry.code !== undefined);
    this.codeLetters.forEach((letter) => delete value[`code${letter}`]);

    // Build optionalAFIP object from selection + value
    const selectedOptionalAFIP: OptionalAFIP = value.optionalAFIP;
    value.optionalAFIP = {
      id: selectedOptionalAFIP?.id ?? null,
      name: selectedOptionalAFIP?.name ?? null,
      value: value.optionalAFIPValue || null,
    };
    delete value.optionalAFIPValue;

    // Coerce numeric fields
    ['order', 'level', 'fixedOrigin', 'maxOrderNumber', 'orderNumber', 'numberPrint'].forEach((field) => {
      value[field] = value[field] !== null && value[field] !== '' ? Number(value[field]) : 0;
    });

    return value as TransactionType;
  }

  public getTransactionType(id: string): void {
    this.loading = true;
    this._transactionTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.transactionType = result.result;
          if (result.status === 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleTransactionType(): void {
    this.transactionTypeForm.markAllAsTouched();
    if (this.operation !== 'delete' && this.transactionTypeForm.invalid) {
      this._toastService.showToast({ type: 'info', message: 'Revise los errores marcados en el formulario' });
      return;
    }

    this.loading = true;
    this.transactionType = this.buildPayload();

    switch (this.operation) {
      case 'add':
        this.saveTransactionType();
        break;
      case 'update':
        this.updateTransactionType();
        break;
      case 'delete':
        this.deleteTransactionType();
        break;
      default:
        this.loading = false;
        break;
    }
  }

  public saveTransactionType(): void {
    this._transactionTypeService
      .save(this.transactionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public updateTransactionType(): void {
    this._transactionTypeService
      .update(this.transactionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteTransactionType(): void {
    this._transactionTypeService
      .delete(this.transactionType._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public returnTo(): void {
    this._router.navigate(['/entities/transaction-types']);
  }
}

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
import { UseOfCFDIService } from '@core/services/use-of-CFDI.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import {
  ApiResponse,
  CompanyType,
  CurrentAccount,
  DescriptionType,
  EntryAmount,
  Movements,
  OPTIONAL_AFIP,
  PaymentMethod,
  PriceType,
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
import { Subject } from 'rxjs';
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
  public readonly fixedLetters = ['', 'X', 'A', 'B', 'C', 'D', 'E', 'M', 'R', 'T', 'Z'];
  public readonly resetOrderNumbers = ['Caja', 'Cantidad', 'Tiempo'];
  public readonly codeLetters = ['A', 'B', 'C', 'D', 'E', 'M', 'R', 'T', 'Z'];

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _branchService: BranchService,
    public _cashBoxTypeService: CashBoxTypeService,
    public _companyService: CompanyService,
    public _employeeTypeService: EmployeeTypeService,
    public _applicationService: ApplicationService,
    public _emailTemplateService: EmailTemplateService,
    public _shipmentMethodService: ShipmentMethodService,
    public _printerService: PrinterService,
    public _paymentMethodService: PaymentMethodService,
    public _useOfCFDIService: UseOfCFDIService,
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

    this.loadPaymentMethods();

    if (this.transactionTypeId) {
      this.getTransactionType(this.transactionTypeId);
    } else {
      this.setValueForm();
    }
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  private loadPaymentMethods(): void {
    this._paymentMethodService
      .find({ query: { operationType: { $ne: 'D' } } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.paymentMethods = Array.isArray(result) ? result : (result?.result ?? []);
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
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
      defectUseOfCFDI: [null, []],
      fixedOrigin: [0, []],
      fixedLetter: ['', []],
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
      allowPromotion: [false, []],
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

  public setValueForm(): void {
    const tt = this.transactionType;

    const selectedOptionalAFIP = tt?.optionalAFIP?.id
      ? (this.optionalAFIPList.find((item) => item.id === tt.optionalAFIP.id) ?? null)
      : null;

    this.transactionTypeForm.patchValue({
      _id: tt?._id ?? '',
      order: tt?.order ?? 1,
      branch: tt?.branch ?? null,
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
      application: tt?.application ?? null,
      electronics: tt?.electronics ?? false,
      tax: tt?.tax ?? false,
      requestTaxes: tt?.requestTaxes ?? false,
      automaticNumbering: tt?.automaticNumbering ?? true,
      fiscalCode: tt?.fiscalCode ?? '',
      defectUseOfCFDI: tt?.defectUseOfCFDI ?? null,
      fixedOrigin: tt?.fixedOrigin ?? 0,
      fixedLetter: tt?.fixedLetter ?? '',
      expirationDate: tt?.expirationDate ? String(tt.expirationDate).substring(0, 10) : '',
      automaticCreation: tt?.automaticCreation ?? false,
      resetOrderNumber: tt?.resetOrderNumber ?? null,
      maxOrderNumber: tt?.maxOrderNumber ?? 0,
      orderNumber: tt?.orderNumber ?? 0,
      cashBoxType: tt?.cashBoxType ?? null,
      optionalAFIP: selectedOptionalAFIP,
      optionalAFIPValue: tt?.optionalAFIP?.value ?? '',
      requestCompany: tt?.requestCompany ?? null,
      company: tt?.company ?? null,
      allowCompanyDiscount: tt?.allowCompanyDiscount ?? true,
      allowPriceList: tt?.allowPriceList ?? true,
      allowPromotion: tt?.allowPromotion ?? false,
      requestEmployee: tt?.requestEmployee ?? null,
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
      defectEmailTemplate: tt?.defectEmailTemplate ?? null,
      requestShipmentMethod: tt?.requestShipmentMethod ?? false,
      defectShipmentMethod: tt?.defectShipmentMethod ?? null,
      labelPrint: tt?.labelPrint ?? '',
      defectPrinter: tt?.defectPrinter ?? null,
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
      fastPayment: tt?.fastPayment ?? null,
      finishCharge: tt?.finishCharge ?? true,
      showKeyboard: tt?.showKeyboard ?? false,
      paymentMethods: tt?.paymentMethods ?? [],
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
          if (result.status === 200) {
            this.transactionType = Array.isArray(result.result) ? result.result[0] : result.result;
            if (this.operation === 'copy') {
              this.transactionType._id = '';
              this.transactionType.creationDate = '';
              this.transactionType.updateDate = '';
              this.transactionType.creationUser = null;
              this.transactionType.updateUser = null;
            }
            this.setValueForm();
          } else {
            this._toastService.showToast(result);
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
      case 'copy':
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

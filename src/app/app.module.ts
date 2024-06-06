import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {HttpClientModule, HttpClient, HTTP_INTERCEPTORS} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {APP_INITIALIZER, ErrorHandler} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router, RouterModule} from '@angular/router';
import {
  NgbModule,
  NgbActiveModal,
  NgbAlertConfig,
  NgbCollapseModule,
  NgbAlertModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/1
// import {NguCarouselModule} from '@ngu/carousel';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {NgxPaginationModule} from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
//import {SocketIoModule, SocketIoConfig} from 'ngx-socket-io';
import {NgxTinymceModule} from 'ngx-tinymce';
import {ToastrModule} from 'ngx-toastr';

import {PushNotificationComponent} from './../app/components/notification/notification.component';
import {AppComponent} from './app.component';
import {_routes} from './app.routes';
import {AddSaleOrderComponent} from './components/add-sale-order/add-sale-order.component';
import {AddressModule} from './components/address/address.module';
import {AddressService} from './components/address/address.service';
import {ApplyDiscountComponent} from './components/apply-discount/apply-discount.component';
import {ArticleFieldService} from './components/article-field/article-field.service';
import {AddArticleFieldComponent} from './components/article-field/article-field/add-article-field.component';
import {DeleteArticleFieldComponent} from './components/article-field/delete-article-field/delete-article-field.component';
import {ListArticleFieldsComponent} from './components/article-field/list-article-fields/list-article-fields.component';
import {UpdateArticleFieldComponent} from './components/article-field/update-article-field/update-article-field.component';
import {ArticleStockService} from './components/article-stock/article-stock.service';
import {AddArticleStockComponent} from './components/article-stock/article-stock/add-article-stock.component';
import {ListArticleStocksComponent} from './components/article-stock/list-article-stocks/list-article-stocks.component';
import {UpdateArticleStockComponent} from './components/article-stock/update-article-stock/update-article-stock.component';
import {AddArticleFieldsComponent} from './components/article/add-article-fields/add-article-fields.component';
import {AddArticleTaxComponent} from './components/article/add-article-tax/add-article-tax.component';
import {AddMeliAttrsComponent} from './components/article/add-meli-attrs/add-meli-attrs.component';
import {ArticleService} from './components/article/article.service';
import {AddArticleComponent} from './components/article/article/add-article.component';
import {ListArticlesPosComponent} from './components/article/list-articles-pos/list-articles-pos.component';
import {ListArticlesComponent} from './components/article/list-articles/list-articles.component';
import {UpdateArticlePriceComponent} from './components/article/update-article-price/update-article-price.component';
import {BankService} from './components/bank/bank.service';
import {BankComponent} from './components/bank/bank/bank.component';
import {ListBankComponent} from './components/bank/list-bank/list-bank.component';
import {BillingComponent} from './components/billing/billing.component';
import {BranchService} from './components/branch/branch.service';
import {BranchComponent} from './components/branch/branch/branch.component';
import {ListBranchComponent} from './components/branch/list-branches/list-branches.component';
import {SelectBranchComponent} from './components/branch/select-branch/select-branch.component';
import {CancellationTypeService} from './components/cancellation-type/cancellation-type.service';
import {CancellationTypeComponent} from './components/cancellation-type/cancellation-type/cancellation-type.component';
import {CancellationTypeAutomaticComponent} from './components/cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import {ListCancellationTypeComponent} from './components/cancellation-type/list-cancellation-types/list-cancellation-types.component';
import {CashBoxService} from './components/cash-box/cash-box.service';
import {CashBoxComponent} from './components/cash-box/cash-box/cash-box.component';
import {ListCashBoxComponent} from './components/cash-box/list-cash-box/list-cash-box.component';
import {ListCashBoxesComponent} from './components/cash-box/list-cash-boxes/list-cash-boxes.component';
import {CategoryService} from './components/category/category.service';
import {ListCategoriesPosComponent} from './components/category/list-categories-pos/list-categories-pos.component';
import {ClassificationService} from './components/classification/classification.service';
import {ClassificationComponent} from './components/classification/classification/classification.component';
import {ListClassificationsComponent} from './components/classification/list-classifications/list-classifications.component';
import {ClockComponent} from './components/clock/clock.component';
import {ClockService} from './components/clock/clock.service';
import {AddCompanyFieldComponent} from './components/company-field/add-company-field.component';
import {CompanyFieldService} from './components/company-field/company-field.service';
import {DeleteCompanyFieldComponent} from './components/company-field/delete-company-field/delete-company-field.component';
import {UpdateCompanyFieldComponent} from './components/company-field/update-company-field/update-company-field.component';
import {AddCompanyFieldsComponent} from './components/company/add-company-fields/add-company-fields.component';
import {CompanyContactService} from './components/company/company-contact.service';
import {CompanyContactComponent} from './components/company/company-contact/company-contact.component';
import {CompanyNewsService} from './components/company/company-news.service';
import {CompanyNewsComponent} from './components/company/company-news/company-news.component';
import {CompanyService} from './components/company/company.service';
import {AddCompanyComponent} from './components/company/company/add-company.component';
import {DeleteCompanyComponent} from './components/company/delete-company/delete-company.component';
import {ListCompaniesComponent} from './components/company/list-companies/list-companies.component';
import {ListCompanyFieldsComponent} from './components/company/list-company-fields/list-company-fields.component';
import {SelectCompanyComponent} from './components/company/select-company/select-company.component';
import {ComponentsModule} from './components/components.module';
import {ConfigComponent} from './components/config/config.component';
import {ConfigService} from './components/config/config.service';
import {CountryService} from './components/country/country.service';
import {CountryComponent} from './components/country/country/country.component';
import {ListCountriesComponent} from './components/country/list-countries/list-countries.component';
import {CurrencyValueService} from './components/currency-value/currency-value.service';
import {CurrencyValueComponent} from './components/currency-value/currency-value/currency-value.component';
import {ListCurrencyValuesComponent} from './components/currency-value/list-currency-values/list-currency-values.component';
import {CurrencyService} from './components/currency/currency.service';
import {CurrencyComponent} from './components/currency/currency/currency.component';
import {ListCurrenciesComponent} from './components/currency/list-currencies/list-currencies.component';
import {CurrentAccountComponent} from './components/current-account/current-account.component';
import {DepositService} from './components/deposit/deposit.service';
import {DepositComponent} from './components/deposit/deposit/deposit.component';
import {ListDepositsComponent} from './components/deposit/list-deposits/list-deposits.component';
import {SelectDepositComponent} from './components/deposit/select-deposit/select-deposit.component';
import {EmailTemplateService} from './components/email-template/email-template.service';
import {EmailTemplateComponent} from './components/email-template/email-template/email-template.component';
import {ListEmailTemplatesComponent} from './components/email-template/list-email-templates/list-email-templates.component';
import {EmployeeService} from './components/employee/employee.service';
import {AddEmployeeComponent} from './components/employee/employee/add-employee.component';
import {ListEmployeesComponent} from './components/employee/list-employees/list-employees.component';
import {SelectEmployeeComponent} from './components/employee/select-employee/select-employee.component';
import {ExportersModule} from './components/export/exporters.module';
import {GalleryService} from './components/gallery/gallery.service';
// import {GalleryComponent} from './components/gallery/gallery/gallery.component';
// import {ListGalleriesComponent} from './components/gallery/list-galleries/list-galleries.component';
//import {ViewGalleryComponent} from './components/gallery/view-gallery/view-gallery.component';
import {IdentificationTypeService} from './components/identification-type/identification-type.service';
import {AddIdentificationTypeComponent} from './components/identification-type/identification-type/add-identification-type.component';
import {ListIdentificationTypesComponent} from './components/identification-type/list-identification-types/list-identification-types.component';
import {ImportComponent} from './components/import/import.component';
import {ImportService} from './components/import/import.service';
import {KardexCheckComponent} from './components/kardex-check/kardex-check.component';
import {ListSummaryOfAccountsComponent} from './components/list-summary-of-accounts/list-summary-of-accounts.component';
import {ListLocationsComponent} from './components/location/list-locations/list-locations.component';
import {LocationService} from './components/location/location.service';
import {LocationComponent} from './components/location/location/location.component';
import {AuthService} from './components/login/auth.service';
import {LoginComponent} from './components/login/login.component';
import {ListMakesComponent} from './components/make/list-makes/list-makes.component';
import {MakeService} from './components/make/make.service';
import {MakeComponent} from './components/make/make/make.component';
import {MercadopagoService} from './components/mercadopago/mercadopago.service';
import {AddMovementOfArticleComponent} from './components/movement-of-article/add-movement-of-article/add-movement-of-article.component';
import {ListMovementsOfArticlesComponent} from './components/movement-of-article/list-movements-of-articles/list-movements-of-articles.component';
import {MovementOfArticleService} from './components/movement-of-article/movement-of-article.service';
import {ListMovementsOfCancellationsComponent} from './components/movement-of-cancellation/list-movements-of-cancellations/list-movements-of-cancellations.component';
import {MovementOfCancellationComponent} from './components/movement-of-cancellation/movement-of-cancellation.component';
import {MovementOfCancellationService} from './components/movement-of-cancellation/movement-of-cancellation.service';
import {AddMovementOfCashComponent} from './components/movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import {DeleteMovementOfCashComponent} from './components/movement-of-cash/delete-movement-of-cash/delete-movement-of-cash.component';
import {EditCheckComponent} from './components/movement-of-cash/edit-check/edit-check.component';
import {ListChecksComponent} from './components/movement-of-cash/list-checks/list-checks.component';
import {ListMovementOfCashesComponent} from './components/movement-of-cash/list-movements-of-cashes/list-movements-of-cashes.component';
import {MovementOfCashService} from './components/movement-of-cash/movement-of-cash.service';
import {SelectChecksComponent} from './components/movement-of-cash/select-checks/select-checks.component';
import {SelectMovementsOfCashesComponent} from './components/movement-of-cash/select-movements-of-cashes/select-movements-of-cashes.component';
import {PushNotificationsService} from './components/notification/notification.service';
import {ListOriginsComponent} from './components/origin/list-origins/list-origins.component';
import {OriginService} from './components/origin/origin.service';
import {OriginComponent} from './components/origin/origin/origin.component';
import {SelectOriginComponent} from './components/origin/select-origin/select-origin.component';
import {ListPaymentMethodsComponent} from './components/payment-method/list-payment-methods/list-payment-methods.component';
import {PaymentMethodService} from './components/payment-method/payment-method.service';
import {PaymentMethodComponent} from './components/payment-method/payment-method/payment-method.component';
import {AbandonedCartsComponent} from './components/point-of-sale/abandoned-carts/abandoned-carts.component';
import {PointOfSaleComponent} from './components/point-of-sale/point-of-sale.component';
import {PosClientViewComponent} from './components/pos-client-view/pos-client-view.component';
import {PosKitchenComponent} from './components/pos-kitchen/pos-kitchen.component';
import {PosPackingComponent} from './components/pos-packing/pos-packing.component';
import {ListPriceListsComponent} from './components/price-list/list-price-lists/list-price-lists.component';
import {PriceListService} from './components/price-list/price-list.service';
import {PriceListComponent} from './components/price-list/price-list/price-list.component';
import {SelectPriceListComponent} from './components/price-list/select-price-list/select-price-list.component';
import {CurrentAccountDetailsComponent} from './components/print/current-account-details/current-account-details.component';
import {PrintArticlesStockComponent} from './components/print/print-articles-stock/print-articles-stock.component';
import {PrintPriceListComponent} from './components/print/print-price-list/print-price-list.component';
import {PrintQRComponent} from './components/print/print-qr/print-qr.component';
import {PrintTransactionTypeComponent} from './components/print/print-transaction-type/print-transaction-type.component';
import {PrintVatBookComponent} from './components/print/print-vat-book/print-vat-book.component';
import {PrintService} from './components/print/print.service';
import {PrintComponent} from './components/print/print/print.component';
import {ListPrintersComponent} from './components/printer/list-printers/list-printers.component';
import {PrinterService} from './components/printer/printer.service';
import {PrinterComponent} from './components/printer/printer/printer.component';
import {ProgressbarModule} from './components/progressbar/progressbar.module';
import {RegisterComponent} from './components/register/register.component';
import {ListRelationTypesComponent} from './components/relation-type/list-relation-types/list-relation-types.component';
import {RelationTypeService} from './components/relation-type/relation-type.service';
import {RelationTypeComponent} from './components/relation-type/relation-type/relation-type.component';
import {ReportBestSellingArticleComponent} from './components/report-best-selling-article/report-best-selling-article.component';
import {ReportBirthdayComponent} from './components/report-birthday/report-birthday.component';
import {ReportKardexComponent} from './components/report-kardex/report-kardex.component';
import {ReportSalesByCategoryComponent} from './components/report-sales-by-category/report-sales-by-category.component';
import {ReportSalesByClientComponent} from './components/report-sales-by-client/report-sales-by-client.component';
import {ReportSalesByEmployeeComponent} from './components/report-sales-by-employee/report-sales-by-employee.component';
import {ReportSalesByMakeComponent} from './components/report-sales-by-make/report-sales-by-make.component';
import {ReportSalesByPaymentMethodComponent} from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import {ReportTransactionTypeComponent} from './components/report-transaction-type/report-transaction-type.component';
import {ListResourcesComponent} from './components/resource/list-resources/list-resources.component';
import {ResourceService} from './components/resource/resource.service';
import {ResourceComponent} from './components/resource/resource/resource.component';
import {ListRoomsComponent} from './components/room/list-rooms/list-rooms.component';
import {RoomService} from './components/room/room.service';
import {RoomComponent} from './components/room/room/room.component';
import {SendEmailComponent} from './components/send-email/send-email.component';
import {EmailService} from './components/send-email/send-email.service';
import {ListStatesComponent} from './components/state/list-states/list-states.component';
import {StateService} from './components/state/state.service';
import {StateComponent} from './components/state/state/state.component';
import {StatisticsComponent} from './components/statistics/statistics.component';
import {ListStructureComponent} from './components/structure/list-structure/list-structure.component';
import {StructureService} from './components/structure/structure.service';
import {StructureComponent} from './components/structure/structure/structure.component';
import {ListTablesComponent} from './components/table/list-tables/list-tables.component';
import {SelectTableComponent} from './components/table/select-table/select-table.component';
import {TableService} from './components/table/table.service';
import {TableComponent} from './components/table/table/table.component';
import {ListTaxesComponent} from './components/tax/list-taxes/list-taxes.component';
import {TaxService} from './components/tax/tax.service';
import {TaxComponent} from './components/tax/tax/tax.component';
import {AddTransactionComponent} from './components/transaction/add-transaction/add-transaction.component';
import {DeleteTransactionComponent} from './components/transaction/delete-transaction/delete-transaction.component';
import {ListTransactionsComponent} from './components/transaction/list-transactions/list-transactions.component';
import {TransactionService} from './components/transaction/transaction.service';
import {ViewTransactionComponent} from './components/transaction/view-transaction/view-transaction.component';
import {ListTransportComponent} from './components/transport/list-transports/list-transports.component';
import {SelectTransportComponent} from './components/transport/select-transport/select-transport.component';
import {TransportService} from './components/transport/transport.service';
import {TransportComponent} from './components/transport/transport/transport.component';
import {ListUsesOfCFDIComponent} from './components/use-of-CFDI.component.ts/list-uses-of-CFDI/list-uses-of-CFDI.component';
import {UseOfCFDIService} from './components/use-of-CFDI.component.ts/use-of-CFDI.service';
import {AddUseOfCFDIComponent} from './components/use-of-CFDI.component.ts/use-of-CFDI/add-use-of-CFDI.component';
import {DeleteUserComponent} from './components/user/delete-user/delete-user.component';
import {ListUsersComponent} from './components/user/list-users/list-users.component';
import {ShortcutComponent} from './components/user/shortcut/shortcut.component';
import {UserService} from './components/user/user.service';
import {AddUserComponent} from './components/user/user/add-user.component';
import {DeleteVariantTypeComponent} from './components/variant-type/delete-variant-type/delete-variant-type.component';
import {ListVariantTypesComponent} from './components/variant-type/list-variant-types/list-variant-types.component';
import {UpdateVariantTypeComponent} from './components/variant-type/update-variant-type/update-variant-type.component';
import {VariantTypeService} from './components/variant-type/variant-type.service';
import {AddVariantTypeComponent} from './components/variant-type/variant-type/add-variant-type.component';
import {AddVariantComponent} from './components/variant/add-variant/add-variant.component';
import {DeleteVariantComponent} from './components/variant/delete-variant/delete-variant.component';
import {ListVariantsComponent} from './components/variant/list-variants/list-variants.component';
import {VariantService} from './components/variant/variant.service';
import {ListVATConditionsComponent} from './components/vat-condition/list-vat-conditions/list-vat-conditions.component';
import {VATConditionService} from './components/vat-condition/vat-condition.service';
import {VATConditionComponent} from './components/vat-condition/vat-condition/vat-condition.component';
import {VoucherReaderComponent} from './components/voucher-reader/voucher-reader.component';
import {VoucherService} from './components/voucher-reader/voucher.service';
import {ClaimComponent} from './layout/claim/claim.component';
import {ClaimService} from './layout/claim/claim.service';
import {HeaderComponent} from './layout/header/header.component';
import {HomeComponent} from './layout/home/home.component';
import {DirectivesModule} from './main/directives/directives.module';
import {AuthGuard} from './main/guards/auth.guard';
import {LicenseGuard} from './main/guards/license.guard';
import {NotificationGuard} from './main/guards/notification.guard';
import {AuthInterceptor} from './main/interceptors/auth.interceptor';
import {PipesModule} from './main/pipes/pipes.module';
import {MeliService} from './main/services/meli.service';
import { SafePipe } from './main/pipes/safe.pipe';
import { CancelComponent } from './components/tiendaNube/cancel/cancel.component';
import { FulfilledComponent } from './components/tiendaNube/fulfilled/fulfilled.component'
import { MenuComponent } from './components/menu/menu.component';
import { MenuService } from './components/menu/menu.service';
import { WebTransactionsComponent } from './components/point-of-sale/web-transactions/web-transactions.component';
import { DateFromToComponent } from './components/tiendaNube/date-from-to/date-from-to.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// const configSocket: SocketIoConfig = {
//   url: 'http://demo.poscloud.com.ar:300',
//   options: {},
// };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    ListEmployeesComponent,
    AddEmployeeComponent,
    ListTablesComponent,
    TableComponent,
    ListCashBoxesComponent,
    ListTransactionsComponent,
    AddSaleOrderComponent,
    DeleteTransactionComponent,
    ListRoomsComponent,
    RoomComponent,
    ListMakesComponent,
    ListVATConditionsComponent,
    VATConditionComponent,
    MakeComponent,
    PointOfSaleComponent,
    LoginComponent,
    AddUserComponent,
    ListUsersComponent,
    DeleteUserComponent,
    ListCompaniesComponent,
    DeleteCompanyComponent,
    AddCompanyComponent,
    ClockComponent,
    PrinterComponent,
    ListPrintersComponent,
    AddMovementOfCashComponent,
    ImportComponent,
    ConfigComponent,
    AddTransactionComponent,
    CurrentAccountComponent,
    SendEmailComponent,
    SelectEmployeeComponent,
    PrintComponent,
    ViewTransactionComponent,
    RegisterComponent,
    AddArticleStockComponent,
    UpdateArticleStockComponent,
    ListArticleStocksComponent,
    AddVariantComponent,
    DeleteVariantComponent,
    ListVariantsComponent,
    AddVariantTypeComponent,
    UpdateVariantTypeComponent,
    DeleteVariantTypeComponent,
    AddArticleFieldsComponent,
    ListVariantTypesComponent,
    AddMovementOfArticleComponent,
    AddArticleTaxComponent,
    TaxComponent,
    ListTaxesComponent,
    ApplyDiscountComponent,
    PaymentMethodComponent,
    ListPaymentMethodsComponent,
    DeleteMovementOfCashComponent,
    StatisticsComponent,
    DepositComponent,
    ListDepositsComponent,
    ReportBestSellingArticleComponent,
    ReportSalesByPaymentMethodComponent,
    ReportSalesByClientComponent,
    ReportSalesByMakeComponent,
    ReportSalesByCategoryComponent,
    ReportBirthdayComponent,
    ReportSalesByEmployeeComponent,
    CashBoxComponent,
    LocationComponent,
    ListLocationsComponent,
    CompanyNewsComponent,
    ListMovementOfCashesComponent,
    AddArticleFieldComponent,
    UpdateArticleFieldComponent,
    DeleteArticleFieldComponent,
    ListArticleFieldsComponent,
    ListSummaryOfAccountsComponent,
    UpdateArticlePriceComponent,
    CompanyContactComponent,
    ListIdentificationTypesComponent,
    AddIdentificationTypeComponent,
    AddUseOfCFDIComponent,
    ListUsesOfCFDIComponent,
    ListRelationTypesComponent,
    RelationTypeComponent,
    AddCompanyFieldComponent,
    UpdateCompanyFieldComponent,
    DeleteCompanyFieldComponent,
    ListCompanyFieldsComponent,
    AddCompanyFieldsComponent,
    PushNotificationComponent,
    CancellationTypeComponent,
    ListCancellationTypeComponent,
    MovementOfCancellationComponent,
    CurrencyComponent,
    ListCurrenciesComponent,
    ReportKardexComponent,
    StateComponent,
    ListStatesComponent,
    CountryComponent,
    ListCountriesComponent,
    BankComponent,
    ListBankComponent,
    BranchComponent,
    ListBranchComponent,
    ListOriginsComponent,
    OriginComponent,
    SelectBranchComponent,
    SelectOriginComponent,
    ClaimComponent,
    TransportComponent,
    ListTransportComponent,
    SelectTransportComponent,
    PrintPriceListComponent,
    ListCashBoxComponent,
    CurrentAccountDetailsComponent,
    PrintArticlesStockComponent,
    PriceListComponent,
    ListPriceListsComponent,
    ListArticlesPosComponent,
    SelectDepositComponent,
    EditCheckComponent,
    PrintVatBookComponent,
    PrintTransactionTypeComponent,
    ShortcutComponent,
    StructureComponent,
    ListStructureComponent,
    ClassificationComponent,
    CancellationTypeAutomaticComponent,
    ListClassificationsComponent,
    ListMovementsOfArticlesComponent,
    VoucherReaderComponent,
    PosKitchenComponent,
    PosClientViewComponent,
    PosPackingComponent,
    ListChecksComponent,
    CurrencyValueComponent,
    ListCurrencyValuesComponent,
    SelectCompanyComponent,
    SelectTableComponent,
    ResourceComponent,
    ListResourcesComponent,
    // GalleryComponent,
    // ListGalleriesComponent,
   // ViewGalleryComponent,
    EmailTemplateComponent,
    ListEmailTemplatesComponent,
    SelectChecksComponent,
    ListCategoriesPosComponent,
    ListMovementsOfCancellationsComponent,
    ReportTransactionTypeComponent,
    PrintQRComponent,
    SelectMovementsOfCashesComponent,
    BillingComponent,
    AbandonedCartsComponent,
    SelectPriceListComponent,
    AddMeliAttrsComponent,
    KardexCheckComponent,
    SafePipe,
    CancelComponent,
    FulfilledComponent,
    MenuComponent,
    WebTransactionsComponent,
    DateFromToComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(_routes, { useHash: true }),
    NgbModule,
    NgbCollapseModule,
    NgbNavModule,
    NgxPaginationModule,
    NgbAlertModule,
    HttpClientModule,
    DragDropModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    //SocketIoModule.forRoot(configSocket),
    ToastrModule.forRoot(),
    // NguCarouselModule,
    NgxTinymceModule.forRoot({
      //baseURL: '//cdn.bootcss.com/tinymce/4.7.13/',
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.0/',
    }),
    ProgressbarModule,
    DirectivesModule,
    PipesModule,
    ComponentsModule,
    ExportersModule,
    NgMultiSelectDropDownModule.forRoot(),
    AddressModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AddressService,
    NgbActiveModal,
    NgbAlertConfig,
    ArticleService,
    EmployeeService,
    TableService,
    CashBoxService,
    TransactionService,
    MovementOfArticleService,
    UserService,
    RoomService,
    MakeService,
    CategoryService,
    CompanyService,
    ClockService,
    PrinterService,
    ImportService,
    ConfigService,
    PaymentMethodService,
    MovementOfCashService,
    PrintService,
    VoucherService,
    EmailService,
    VATConditionService,
    ArticleStockService,
    VariantTypeService,
    VariantService,
    TaxService,
    DepositService,
    LocationService,
    CompanyNewsService,
    ArticleFieldService,
    CompanyContactService,
    IdentificationTypeService,
    UseOfCFDIService,
    RelationTypeService,
    CompanyFieldService,
    CancellationTypeService,
    MovementOfCancellationService,
    CurrencyService,
    StateService,
    CountryService,
    BankService,
    BranchService,
    AuthGuard,
    NotificationGuard,
    LicenseGuard,
    AuthService,
    OriginService,
    ClaimService,
    TransportService,
    PriceListService,
    StructureService,
    ClassificationService,
    CurrencyValueService,
    ResourceService,
    GalleryService,
    EmailTemplateService,
    PushNotificationsService,
    MercadopagoService,
    MeliService,
    MenuService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}

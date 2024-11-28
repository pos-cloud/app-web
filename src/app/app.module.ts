import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  NgbActiveModal,
  NgbAlertConfig,
  NgbAlertModule,
  NgbCollapseModule,
  NgbModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/1
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
//import {SocketIoModule, SocketIoConfig} from 'ngx-socket-io';
import { NgxTinymceModule } from 'ngx-tinymce';
import { ToastrModule } from 'ngx-toastr';

import { ServiceWorkerModule } from '@angular/service-worker';
import { PushNotificationComponent } from './../app/components/notification/notification.component';
import { AppComponent } from './app.component';
import { _routes } from './app.routes';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { AddressModule } from './components/address/address.module';
import { ApplyDiscountComponent } from './components/apply-discount/apply-discount.component';
import { AddArticleFieldComponent } from './components/article-field/article-field/add-article-field.component';
import { DeleteArticleFieldComponent } from './components/article-field/delete-article-field/delete-article-field.component';
import { ListArticleFieldsComponent } from './components/article-field/list-article-fields/list-article-fields.component';
import { UpdateArticleFieldComponent } from './components/article-field/update-article-field/update-article-field.component';
import { AddArticleStockComponent } from './components/article-stock/article-stock/add-article-stock.component';
import { ListArticleStocksComponent } from './components/article-stock/list-article-stocks/list-article-stocks.component';
import { UpdateArticleStockComponent } from './components/article-stock/update-article-stock/update-article-stock.component';
import { ListArticlesPosComponent } from './components/article/list-articles-pos/list-articles-pos.component';
import { BankComponent } from './components/bank/bank/bank.component';
import { ListBankComponent } from './components/bank/list-bank/list-bank.component';
import { BranchComponent } from './components/branch/branch/branch.component';
import { ListBranchComponent } from './components/branch/list-branches/list-branches.component';
import { SelectBranchComponent } from './components/branch/select-branch/select-branch.component';
import { CancellationTypeComponent } from './components/cancellation-type/cancellation-type/cancellation-type.component';
import { CancellationTypeAutomaticComponent } from './components/cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import { ListCancellationTypeComponent } from './components/cancellation-type/list-cancellation-types/list-cancellation-types.component';
import { CashBoxComponent } from './components/cash-box/cash-box/cash-box.component';
import { ListCashBoxComponent } from './components/cash-box/list-cash-box/list-cash-box.component';
import { ListCashBoxesComponent } from './components/cash-box/list-cash-boxes/list-cash-boxes.component';
import { ListCategoriesPosComponent } from './components/category/list-categories-pos/list-categories-pos.component';
import { ClassificationComponent } from './components/classification/classification/classification.component';
import { ListClassificationsComponent } from './components/classification/list-classifications/list-classifications.component';
import { ClockComponent } from './components/clock/clock.component';
import { AddCompanyFieldComponent } from './components/company-field/add-company-field.component';
import { DeleteCompanyFieldComponent } from './components/company-field/delete-company-field/delete-company-field.component';
import { UpdateCompanyFieldComponent } from './components/company-field/update-company-field/update-company-field.component';
import { AddCompanyFieldsComponent } from './components/company/add-company-fields/add-company-fields.component';
import { CompanyContactComponent } from './components/company/company-contact/company-contact.component';
import { CompanyNewsComponent } from './components/company/company-news/company-news.component';
import { AddCompanyComponent } from './components/company/company/add-company.component';
import { DeleteCompanyComponent } from './components/company/delete-company/delete-company.component';
import { ListCompaniesComponent } from './components/company/list-companies/list-companies.component';
import { ListCompanyFieldsComponent } from './components/company/list-company-fields/list-company-fields.component';
import { SelectCompanyComponent } from './components/company/select-company/select-company.component';
import { ComponentsModule } from './components/components.module';
import { ConfigComponent } from './components/config/config.component';
import { CountryComponent } from './components/country/country/country.component';
import { ListCountriesComponent } from './components/country/list-countries/list-countries.component';
import { CurrencyValueComponent } from './components/currency-value/currency-value/currency-value.component';
import { ListCurrencyValuesComponent } from './components/currency-value/list-currency-values/list-currency-values.component';
import { CurrencyComponent } from './components/currency/currency/currency.component';
import { ListCurrenciesComponent } from './components/currency/list-currencies/list-currencies.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { DepositComponent } from './components/deposit/deposit/deposit.component';
import { ListDepositsComponent } from './components/deposit/list-deposits/list-deposits.component';
import { SelectDepositComponent } from './components/deposit/select-deposit/select-deposit.component';
import { EmailTemplateComponent } from './components/email-template/email-template/email-template.component';
import { ListEmailTemplatesComponent } from './components/email-template/list-email-templates/list-email-templates.component';
import { ExportersModule } from './components/export/exporters.module';
import { AddIdentificationTypeComponent } from './components/identification-type/identification-type/add-identification-type.component';
import { ListIdentificationTypesComponent } from './components/identification-type/list-identification-types/list-identification-types.component';
import { KardexCheckComponent } from './components/kardex-check/kardex-check.component';
import { ListSummaryOfAccountsComponent } from './components/list-summary-of-accounts/list-summary-of-accounts.component';
import { ListLocationsComponent } from './components/location/list-locations/list-locations.component';
import { LocationComponent } from './components/location/location/location.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { AddMovementOfArticleComponent } from './components/movement-of-article/add-movement-of-article/add-movement-of-article.component';
import { ListMovementsOfArticlesComponent } from './components/movement-of-article/list-movements-of-articles/list-movements-of-articles.component';
import { ListMovementsOfCancellationsComponent } from './components/movement-of-cancellation/list-movements-of-cancellations/list-movements-of-cancellations.component';
import { MovementOfCancellationComponent } from './components/movement-of-cancellation/movement-of-cancellation.component';
import { AddMovementOfCashComponent } from './components/movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import { DeleteMovementOfCashComponent } from './components/movement-of-cash/delete-movement-of-cash/delete-movement-of-cash.component';
import { EditCheckComponent } from './components/movement-of-cash/edit-check/edit-check.component';
import { ListChecksComponent } from './components/movement-of-cash/list-checks/list-checks.component';
import { ListMovementOfCashesComponent } from './components/movement-of-cash/list-movements-of-cashes/list-movements-of-cashes.component';
import { SelectChecksComponent } from './components/movement-of-cash/select-checks/select-checks.component';
import { SelectMovementsOfCashesComponent } from './components/movement-of-cash/select-movements-of-cashes/select-movements-of-cashes.component';
import { ListOriginsComponent } from './components/origin/list-origins/list-origins.component';
import { OriginComponent } from './components/origin/origin/origin.component';
import { SelectOriginComponent } from './components/origin/select-origin/select-origin.component';
import { ListPaymentMethodsComponent } from './components/payment-method/list-payment-methods/list-payment-methods.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method/payment-method.component';
import { AbandonedCartsComponent } from './components/point-of-sale/abandoned-carts/abandoned-carts.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { WebTransactionsComponent } from './components/point-of-sale/web-transactions/web-transactions.component';
import { PosClientViewComponent } from './components/pos-client-view/pos-client-view.component';
import { PosKitchenComponent } from './components/pos-kitchen/pos-kitchen.component';
import { PosPackingComponent } from './components/pos-packing/pos-packing.component';
import { ListPriceListsComponent } from './components/price-list/list-price-lists/list-price-lists.component';
import { PriceListComponent } from './components/price-list/price-list/price-list.component';
import { SelectPriceListComponent } from './components/price-list/select-price-list/select-price-list.component';
import { CurrentAccountDetailsComponent } from './components/print/current-account-details/current-account-details.component';
import { PrintArticlesStockComponent } from './components/print/print-articles-stock/print-articles-stock.component';
import { PrintPriceListComponent } from './components/print/print-price-list/print-price-list.component';
import { PrintQRComponent } from './components/print/print-qr/print-qr.component';
import { PrintTransactionTypeComponent } from './components/print/print-transaction-type/print-transaction-type.component';
import { PrintVatBookComponent } from './components/print/print-vat-book/print-vat-book.component';
import { PrintComponent } from './components/print/print/print.component';
import { ListPrintersComponent } from './components/printer/list-printers/list-printers.component';
import { PrinterComponent } from './components/printer/printer/printer.component';
import { RegisterComponent } from './components/register/register.component';
import { ListRelationTypesComponent } from './components/relation-type/list-relation-types/list-relation-types.component';
import { RelationTypeComponent } from './components/relation-type/relation-type/relation-type.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ReportBirthdayComponent } from './components/report-birthday/report-birthday.component';
import { ReportKardexComponent } from './components/report-kardex/report-kardex.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportTransactionTypeComponent } from './components/report-transaction-type/report-transaction-type.component';
import { ListRoomsComponent } from './components/room/list-rooms/list-rooms.component';
import { RoomComponent } from './components/room/room/room.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { ListStatesComponent } from './components/state/list-states/list-states.component';
import { StateComponent } from './components/state/state/state.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ListStructureComponent } from './components/structure/list-structure/list-structure.component';
import { StructureComponent } from './components/structure/structure/structure.component';
import { ListTablesComponent } from './components/table/list-tables/list-tables.component';
import { SelectTableComponent } from './components/table/select-table/select-table.component';
import { TableComponent } from './components/table/table/table.component';
import { ListTaxesComponent } from './components/tax/list-taxes/list-taxes.component';
import { TaxComponent } from './components/tax/tax/tax.component';
import { CancelComponent } from './components/tiendaNube/cancel/cancel.component';
import { DateFromToComponent } from './components/tiendaNube/date-from-to/date-from-to.component';
import { FulfilledComponent } from './components/tiendaNube/fulfilled/fulfilled.component';
import { AddTransactionComponent } from './components/transaction/add-transaction/add-transaction.component';
import { ListTransactionsComponent } from './components/transaction/list-transactions/list-transactions.component';
import { ViewTransactionComponent } from './components/transaction/view-transaction/view-transaction.component';
import { ListTransportComponent } from './components/transport/list-transports/list-transports.component';
import { SelectTransportComponent } from './components/transport/select-transport/select-transport.component';
import { TransportComponent } from './components/transport/transport/transport.component';
import { ListUsesOfCFDIComponent } from './components/use-of-CFDI.component.ts/list-uses-of-CFDI/list-uses-of-CFDI.component';
import { AddUseOfCFDIComponent } from './components/use-of-CFDI.component.ts/use-of-CFDI/add-use-of-CFDI.component';
import { DeleteUserComponent } from './components/user/delete-user/delete-user.component';
import { ListUsersComponent } from './components/user/list-users/list-users.component';
import { ShortcutComponent } from './components/user/shortcut/shortcut.component';
import { AddUserComponent } from './components/user/user/add-user.component';
import { DeleteVariantTypeComponent } from './components/variant-type/delete-variant-type/delete-variant-type.component';
import { ListVariantTypesComponent } from './components/variant-type/list-variant-types/list-variant-types.component';
import { UpdateVariantTypeComponent } from './components/variant-type/update-variant-type/update-variant-type.component';
import { AddVariantTypeComponent } from './components/variant-type/variant-type/add-variant-type.component';
import { AddVariantComponent } from './components/variant/add-variant/add-variant.component';
import { DeleteVariantComponent } from './components/variant/delete-variant/delete-variant.component';
import { ListVariantsComponent } from './components/variant/list-variants/list-variants.component';
import { ListVATConditionsComponent } from './components/vat-condition/list-vat-conditions/list-vat-conditions.component';
import { VATConditionComponent } from './components/vat-condition/vat-condition/vat-condition.component';
import { VoucherReaderComponent } from './components/voucher-reader/voucher-reader.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LicenseGuard } from './core/guards/license.guard';
import { NotificationGuard } from './core/guards/notification.guard';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { HeaderComponent } from './layout/header/header.component';
import { Header2Component } from './layout/header2/header2.component';
import { HomeComponent } from './layout/home/home.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FocusDirective } from './shared/directives/focus.directive';
import { PipesModule } from './shared/pipes/pipes.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// const configSocket: SocketIoConfig = {
//   url: 'http://demo.poscloud.com.ar:300',
//   options: {},
// };

@NgModule({
  declarations: [
    ToastComponent,
    AppComponent,
    HomeComponent,
    HeaderComponent,
    Header2Component,
    ListTablesComponent,
    TableComponent,
    ListCashBoxesComponent,
    ListTransactionsComponent,
    AddSaleOrderComponent,
    ListRoomsComponent,
    RoomComponent,
    ListVATConditionsComponent,
    VATConditionComponent,
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
    ConfigComponent,
    AddTransactionComponent,
    CurrentAccountComponent,
    SendEmailComponent,
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
    ListVariantTypesComponent,
    AddMovementOfArticleComponent,
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
    EmailTemplateComponent,
    ListEmailTemplatesComponent,
    SelectChecksComponent,
    ListCategoriesPosComponent,
    ListMovementsOfCancellationsComponent,
    ReportTransactionTypeComponent,
    PrintQRComponent,
    SelectMovementsOfCashesComponent,
    AbandonedCartsComponent,
    SelectPriceListComponent,
    KardexCheckComponent,
    CancelComponent,
    FulfilledComponent,
    MenuComponent,
    WebTransactionsComponent,
    DateFromToComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(_routes, { useHash: true }),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
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
    NgxTinymceModule.forRoot({
      //baseURL: '//cdn.bootcss.com/tinymce/4.7.13/',
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.0/',
    }),
    PipesModule,
    ComponentsModule,
    ExportersModule,
    NgMultiSelectDropDownModule.forRoot(),
    AddressModule,
    FocusDirective,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    NgbActiveModal,
    NgbAlertConfig,
    AuthGuard,
    NotificationGuard,
    LicenseGuard,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}

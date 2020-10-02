import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';

// paquetes de terceros
import { NgbModule, NgbActiveModal, NgbAlertConfig, NgbCollapseModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { PushNotificationComponent } from './../app/components/notification/notification.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';
import { NgxTinymceModule } from 'ngx-tinymce';

// rutas
import { _routes } from './app.routes';

// servicios
import { ArticleService } from './components/article/article.service';
import { EmployeeService } from './components/employee/employee.service';
import { TableService } from './components/table/table.service';
import { CashBoxService } from './components/cash-box/cash-box.service';
import { TransactionService } from './components/transaction/transaction.service';
import { TransactionTypeService } from './components/transaction-type/transaction-type.service';
import { MovementOfArticleService } from './components/movement-of-article/movement-of-article.service';
import { UserService } from './components/user/user.service';
import { RoomService } from './components/room/room.service';
import { MakeService } from './components/make/make.service';
import { CategoryService } from './components/category/category.service';
import { CompanyService } from './components/company/company.service';
import { ClockService } from './components/clock/clock.service';
import { PrinterService } from './components/printer/printer.service';
import { ImportService } from './components/import/import.service';
import { ConfigService } from './components/config/config.service';
import { PaymentMethodService } from './components/payment-method/payment-method.service';
import { EmailService } from './components/send-email/send-email.service';
import { MovementOfCashService } from './components/movement-of-cash/movement-of-cash.service';
import { PrintService } from './components/print/print.service';
import { VATConditionService } from './components/vat-condition/vat-condition.service';
import { ArticleStockService } from './components/article-stock/article-stock.service';
import { VariantTypeService } from './components/variant-type/variant-type.service';
import { VariantService } from './components/variant/variant.service';
import { VariantValueService } from './components/variant-value/variant-value.service';
import { DepositService } from './components/deposit/deposit.service';
import { LocationService } from './components/location/location.service';
import { CompanyNewsService } from './components/company/company-news.service';
import { ArticleFieldService } from './components/article-field/article-field.service';
import { CompanyGroupService } from "./components/company-group/company-group.service";
import { CompanyContactService } from "./components/company/company-contact.service";
import { CompanyFieldService } from './components/company-field/company-field.service';
import { BankService } from './components/bank/bank.service';
import { PriceListService } from './components/price-list/price-list.service';

// guards
import { AuthGuard } from './main/guards/auth.guard';

// componentes
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from './layout/home/home.component';
import { AppComponent } from './app.component';
import { ListArticlesComponent } from './components/article/list-articles/list-articles.component';
import { AddArticleComponent } from './components/article/article/add-article.component';
import { ListEmployeesComponent } from './components/employee/list-employees/list-employees.component';
import { AddEmployeeComponent } from './components/employee/employee/add-employee.component';
import { ListTablesComponent } from './components/table/list-tables/list-tables.component';
import { TableComponent } from './components/table/table/table.component';
import { ListCashBoxesComponent } from './components/cash-box/list-cash-boxes/list-cash-boxes.component';
import { ListTransactionsComponent } from './components/transaction/list-transactions/list-transactions.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { DeleteTransactionComponent } from './components/transaction/delete-transaction/delete-transaction.component';
import { ListRoomsComponent } from './components/room/list-rooms/list-rooms.component';
import { RoomComponent } from './components/room/room/room.component';
import { ListMakesComponent } from './components/make/list-makes/list-makes.component';
import { MakeComponent } from './components/make/make/make.component';
import { ListCategoriesComponent } from './components/category/list-categories/list-categories.component';
import { CategoryComponent } from './components/category/category/category.component';
import { AddUserComponent } from './components/user/user/add-user.component';
import { ListUsersComponent } from './components/user/list-users/list-users.component';
import { DeleteUserComponent } from './components/user/delete-user/delete-user.component';
import { ListCompaniesComponent } from './components/company/list-companies/list-companies.component';
import { DeleteCompanyComponent } from './components/company/delete-company/delete-company.component';
import { AddCompanyComponent } from './components/company/company/add-company.component';
import { PrinterComponent } from './components/printer/printer/printer.component';
import { ListPrintersComponent } from './components/printer/list-printers/list-printers.component';
import { AddMovementOfCashComponent } from './components/movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import { AddArticleStockComponent } from './components/article-stock/article-stock/add-article-stock.component';
import { ConfigComponent } from './components/config/config.component';
import { AddTransactionComponent } from './components/transaction/add-transaction/add-transaction.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { SelectEmployeeComponent } from './components/employee/select-employee/select-employee.component';
import { PrintComponent } from './components/print/print/print.component';
import { ViewTransactionComponent } from './components/transaction/view-transaction/view-transaction.component';
import { ListTransactionTypesComponent } from './components/transaction-type/list-transaction-types/list-transaction-types.component';
import { TransactionTypeComponent } from './components/transaction-type/transaction-type/transaction-type.component';
import { UpdateArticleStockComponent } from './components/article-stock/update-article-stock/update-article-stock.component';
import { ListArticleStocksComponent } from './components/article-stock/list-article-stocks/list-article-stocks.component';
import { AddVariantComponent } from './components/variant/add-variant/add-variant.component';
import { DeleteVariantComponent } from './components/variant/delete-variant/delete-variant.component';
import { ListVariantsComponent } from './components/variant/list-variants/list-variants.component';
import { AddVariantTypeComponent } from './components/variant-type/variant-type/add-variant-type.component';
import { UpdateVariantTypeComponent } from './components/variant-type/update-variant-type/update-variant-type.component';
import { DeleteVariantTypeComponent } from './components/variant-type/delete-variant-type/delete-variant-type.component';
import { ListVariantTypesComponent } from './components/variant-type/list-variant-types/list-variant-types.component';
import { ListVariantValuesComponent } from './components/variant-value/list-variant-values/list-variant-values.component';
import { DeleteVariantValueComponent } from './components/variant-value/delete-variant-value/delete-variant-value.component';
import { UpdateVariantValueComponent } from './components/variant-value/update-variant-value/update-variant-value.component';
import { AddVariantValueComponent } from './components/variant-value/variant-value/add-variant-value.component';
import { AddMovementOfArticleComponent } from './components/movement-of-article/add-movement-of-article/add-movement-of-article.component';
import { AddArticleTaxComponent } from './components/article/add-article-tax/add-article-tax.component';
import { ApplyDiscountComponent } from './components/apply-discount/apply-discount.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method/payment-method.component';
import { ListPaymentMethodsComponent } from './components/payment-method/list-payment-methods/list-payment-methods.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { LoginComponent } from './components/login/login.component';
import { ClockComponent } from './components/clock/clock.component';
import { ImportComponent } from './components/import/import.component';
import { RegisterComponent } from './components/register/register.component';
import { LicensePaymentComponent } from './components/payment-method/license-payment/license-payment.component'

// directives
import { DeleteMovementOfCashComponent } from './components/movement-of-cash/delete-movement-of-cash/delete-movement-of-cash.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { DepositComponent } from './components/deposit/deposit/deposit.component';
import { ListDepositsComponent } from './components/deposit/list-deposits/list-deposits.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { CashBoxComponent } from './components/cash-box/cash-box/cash-box.component';
import { LocationComponent } from './components/location/location/location.component';
import { ListLocationsComponent } from './components/location/list-locations/list-locations.component';
import { CompanyNewsComponent } from './components/company/company-news/company-news.component';
import { ListMovementOfCashesComponent } from './components/movement-of-cash/list-movements-of-cashes/list-movements-of-cashes.component';
import { AddArticleFieldComponent } from './components/article-field/article-field/add-article-field.component';
import { UpdateArticleFieldComponent } from './components/article-field/update-article-field/update-article-field.component';
import { DeleteArticleFieldComponent } from './components/article-field/delete-article-field/delete-article-field.component';
import { ListArticleFieldsComponent } from './components/article-field/list-article-fields/list-article-fields.component';
import { ListSummaryOfAccountsComponent } from './components/list-summary-of-accounts/list-summary-of-accounts.component';
import { ListVATConditionsComponent } from './components/vat-condition/list-vat-conditions/list-vat-conditions.component';
import { ListCompaniesGroupComponent } from './components/company-group/list-companies-group/list-companies-group.component';
import { CompanyGroupComponent } from './components/company-group/company-group/company-group.component';
import { UpdateArticlePriceComponent } from './components/article/update-article-price/update-article-price.component';
import { CompanyContactComponent } from './components/company/company-contact/company-contact.component';
import { VATConditionComponent } from './components/vat-condition/vat-condition/vat-condition.component';
import { ReportBirthdayComponent } from './components/report-birthday/report-birthday.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component'
import { ListIdentificationTypesComponent } from './components/identification-type/list-identification-types/list-identification-types.component';
import { AddIdentificationTypeComponent } from './components/identification-type/identification-type/add-identification-type.component';
import { IdentificationTypeService } from './components/identification-type/identification-type.service';
import { UseOfCFDIService } from './components/use-of-CFDI.component.ts/use-of-CFDI.service';
import { AddUseOfCFDIComponent } from './components/use-of-CFDI.component.ts/use-of-CFDI/add-use-of-CFDI.component';
import { ListUsesOfCFDIComponent } from './components/use-of-CFDI.component.ts/list-uses-of-CFDI/list-uses-of-CFDI.component';
import { ListRelationTypesComponent } from './components/relation-type/list-relation-types/list-relation-types.component';
import { RelationTypeComponent } from './components/relation-type/relation-type/relation-type.component';
import { RelationTypeService } from './components/relation-type/relation-type.service';
import { StateService } from './components/state/state.service';

import { AddCompanyFieldComponent } from './components/company-field/add-company-field.component';
import { UpdateCompanyFieldComponent } from './components/company-field/update-company-field/update-company-field.component';
import { DeleteCompanyFieldComponent } from './components/company-field/delete-company-field/delete-company-field.component';
import { ListCompanyFieldsComponent } from './components/company/list-company-fields/list-company-fields.component';
import { AddCompanyFieldsComponent } from './components/company/add-company-fields/add-company-fields.component';
import { CancellationTypeComponent } from './components/cancellation-type/cancellation-type/cancellation-type.component';
import { ListCancellationTypeComponent } from './components/cancellation-type/list-cancellation-types/list-cancellation-types.component';
import { CancellationTypeService } from './components/cancellation-type/cancellation-type.service';
import { RouterModule } from '@angular/router';
import { MovementOfCancellationComponent } from "./components/movement-of-cancellation/movement-of-cancellation.component";
import { MovementOfCancellationService } from './components/movement-of-cancellation/movement-of-cancellation.service';
import { CurrencyComponent } from './components/currency/currency/currency.component';
import { ListCurrenciesComponent } from './components/currency/list-currencies/list-currencies.component';
import { CurrencyService } from './components/currency/currency.service';
import { ReportKardexComponent } from './components/report-kardex/report-kardex.component';
import { StateComponent } from './components/state/state/state.component';
import { ListStatesComponent } from './components/state/list-states/list-states.component';
import { CountryComponent } from './components/country/country/country.component';
import { ListCountriesComponent } from './components/country/list-countries/list-countries.component';
import { CountryService } from './components/country/country.service';
import { BankComponent } from './components/bank/bank/bank.component';
import { ListBankComponent } from './components/bank/list-bank/list-bank.component';
import { AuthService } from './components/login/auth.service';
import { BranchComponent } from './components/branch/branch/branch.component';
import { ListBranchComponent } from './components/branch/list-branches/list-branches.component';
import { BranchService } from './components/branch/branch.service';
import { ListOriginsComponent } from './components/origin/list-origins/list-origins.component';
import { OriginService } from './components/origin/origin.service';
import { OriginComponent } from './components/origin/origin/origin.component';
import { SelectBranchComponent } from './components/branch/select-branch/select-branch.component';
import { SelectOriginComponent } from './components/origin/select-origin/select-origin.component';
import { ClaimService } from './layout/claim/claim.service';
import { ClaimComponent } from './layout/claim/claim.component';
import { TransportComponent } from './components/transport/transport/transport.component';
import { TransportService } from './components/transport/transport.service';
import { ListTransportComponent } from './components/transport/list-transports/list-transports.component';
import { SelectTransportComponent } from './components/transport/select-transport/select-transport.component';
import { PrintPriceListComponent } from './components/print/print-price-list/print-price-list.component';
import { ListCashBoxComponent } from './components/cash-box/list-cash-box/list-cash-box.component';
import { CurrentAccountDetailsComponent } from './components/print/current-account-details/current-account-details.component';
import { PrintArticlesStockComponent } from './components/print/print-articles-stock/print-articles-stock.component';
import { PriceListComponent } from './components/price-list/price-list/price-list.component';
import { ListPriceListsComponent } from './components/price-list/list-price-lists/list-price-lists.component';
import { ListArticlesPosComponent } from './components/article/list-articles-pos/list-articles-pos.component';
import { SelectDepositComponent } from './components/deposit/select-deposit/select-deposit.component';
import { EditCheckComponent } from './components/movement-of-cash/edit-check/edit-check.component';
import { PrintVatBookComponent } from './components/print/print-vat-book/print-vat-book.component';
import { PrintTransactionTypeComponent } from './components/print/print-transaction-type/print-transaction-type.component';
import { ShortcutComponent } from './components/user/shortcut/shortcut.component';
import { LicenseGuard } from './main/guards/license.guard';
import { StructureService } from './components/structure/structure.service';
import { StructureComponent } from './components/structure/structure/structure.component';
import { ListStructureComponent } from './components/structure/list-structure/list-structure.component';
import { ClassificationComponent } from './components/classification/classification/classification.component';
import { ListClassificationsComponent } from './components/classification/list-classifications/list-classifications.component';
import { ClassificationService } from './components/classification/classification.service';
import { ListMovementsOfArticlesComponent } from './components/movement-of-article/list-movements-of-articles/list-movements-of-articles.component';
import { CancellationTypeAutomaticComponent } from './components/cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import { VoucherReaderComponent } from './components/voucher-reader/voucher-reader.component';
import { PosKitchenComponent } from './components/pos-kitchen/pos-kitchen.component';
import { ListChecksComponent } from './components/movement-of-cash/list-checks/list-checks.component';
import { PosClientViewComponent } from './components/pos-client-view/pos-client-view.component';
import { PosPackingComponent } from './components/pos-packing/pos-packing.component';
import { CurrencyValueComponent } from './components/currency-value/currency-value/currency-value.component';
import { ListCurrencyValuesComponent } from './components/currency-value/list-currency-values/list-currency-values.component';
import { CurrencyValueService } from './components/currency-value/currency-value.service';
import { SelectTableComponent } from './components/table/select-table/select-table.component';
import { ResourceComponent } from './components/resource/resource/resource.component';
import { ListResourcesComponent } from './components/resource/list-resources/list-resources.component';
import { ResourceService } from './components/resource/resource.service';
import { GalleryComponent } from './components/gallery/gallery/gallery.component';
import { ListGalleriesComponent } from './components/gallery/list-galleries/list-galleries.component';
import { GalleryService } from './components/gallery/gallery.service';
import { ViewGalleryComponent } from './components/gallery/view-gallery/view-gallery.component';

import { NguCarouselModule } from '@ngu/carousel';
import { EmailTemplateComponent } from './components/email-template/email-template/email-template.component';
import { ListEmailTemplatesComponent } from './components/email-template/list-email-templates/list-email-templates.component';
import { EmailTemplateService } from './components/email-template/email-template.service';
import { VoucherService } from './components/voucher-reader/voucher.service';
import { SelectChecksComponent } from './components/movement-of-cash/select-checks/select-checks.component';
import { NotificationGuard } from './main/guards/notification.guard';
import { SelectCompanyComponent } from './components/company/select-company/select-company.component';
import { TaxComponent } from './components/tax/tax/tax.component';
import { ListTaxesComponent } from './components/tax/list-taxes/list-taxes.component';
import { TaxService } from './components/tax/tax.service';
import { AddArticleFieldsComponent } from './components/article/add-article-fields/add-article-fields.component';
import { ProgressbarModule } from './components/progressbar/progressbar.module';
import { DirectivesModule } from './main/directives/directives.module';
import { PipesModule } from './main/pipes/pipes.module';
import { ExportersModule } from './components/export/exporters.module';
import { ListMovementsOfCancellationsComponent } from './components/movement-of-cancellation/list-movements-of-cancellations/list-movements-of-cancellations.component';
import { ComponentsModule } from './components/components.module';
import { ListCategoriesPosComponent } from './components/category/list-categories-pos/list-categories-pos.component';
import { AuthInterceptor } from './main/interceptors/auth.interceptor';
import { PushNotificationsService } from './components/notification/notification.service';
import { ReportTransactionTypeComponent } from './components/report-transaction-type/report-transaction-type.component';

// const configSocket: SocketIoConfig = { url: "http://localhost:300", options: {} }; // TEST
const configSocket: SocketIoConfig = { url: "http://demo.poscloud.com.ar:300", options: {} }; // PROD
//const configSocket: SocketIoConfig = { url: "http://192.168.0.88:300", options: {transports: ['websocket']} }; // PROD

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http);
// }

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

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
    ListCategoriesComponent,
    CategoryComponent,
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
    ListTransactionTypesComponent,
    TransactionTypeComponent,
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
    ListVariantValuesComponent,
    DeleteVariantValueComponent,
    UpdateVariantValueComponent,
    AddVariantValueComponent,
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
    ListCompaniesGroupComponent,
    CompanyGroupComponent,
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
    LicensePaymentComponent,
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
    GalleryComponent,
    ListGalleriesComponent,
    ViewGalleryComponent,
    EmailTemplateComponent,
    ListEmailTemplatesComponent,
    SelectChecksComponent,
    ListCategoriesPosComponent,
    ListMovementsOfCancellationsComponent,
    ReportTransactionTypeComponent
  ],
  entryComponents: [
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
    ListCategoriesComponent,
    CategoryComponent,
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
    ListTransactionTypesComponent,
    TransactionTypeComponent,
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
    ListVariantValuesComponent,
    DeleteVariantValueComponent,
    UpdateVariantValueComponent,
    AddVariantValueComponent,
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
    ListCompaniesGroupComponent,
    CompanyGroupComponent,
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
    LicensePaymentComponent,
    CancellationTypeComponent,
    MovementOfCancellationComponent,
    CurrencyComponent,
    ListCurrenciesComponent,
    ReportKardexComponent,
    StateComponent,
    CountryComponent,
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
    SelectTransportComponent,
    PrintPriceListComponent,
    ListCashBoxesComponent,
    CurrentAccountDetailsComponent,
    PrintArticlesStockComponent,
    PriceListComponent,
    SelectDepositComponent,
    EditCheckComponent,
    PrintVatBookComponent,
    PrintTransactionTypeComponent,
    ShortcutComponent,
    StructureComponent,
    ClassificationComponent,
    CancellationTypeAutomaticComponent,
    ListMovementsOfArticlesComponent,
    VoucherReaderComponent,
    PosKitchenComponent,
    PosClientViewComponent,
    PosPackingComponent,
    CurrencyValueComponent,
    SelectCompanyComponent,
    SelectTableComponent,
    ResourceComponent,
    GalleryComponent,
    CurrentAccountDetailsComponent,
    EmailTemplateComponent,
    SelectChecksComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(_routes, { useHash: true }),
    NgbModule,
    NgbCollapseModule,
    NgxPaginationModule,
    NgbAlertModule,
    HttpClientModule,
    DragDropModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SocketIoModule.forRoot(configSocket),
    ToastrModule.forRoot(),
    NguCarouselModule,
    NgxTinymceModule.forRoot({
      //baseURL: '//cdn.bootcss.com/tinymce/4.7.13/',
      baseURL: '//cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.0/',
    }),
    ProgressbarModule,
    DirectivesModule,
    PipesModule,
    ComponentsModule,
    ExportersModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    NgbActiveModal,
    NgbAlertConfig,
    ArticleService,
    EmployeeService,
    TableService,
    CashBoxService,
    TransactionService,
    TransactionTypeService,
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
    VariantValueService,
    TaxService,
    DepositService,
    LocationService,
    CompanyNewsService,
    ArticleFieldService,
    CompanyGroupService,
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
    PushNotificationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

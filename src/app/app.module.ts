import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';

// paquetes de terceros
import { NgbModule, NgbActiveModal, NgbAlertConfig, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { PushNotificationComponent } from './../app/components/notification/notification.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';

// rutas
import { _routes } from './app.routes';

// servicios
import { ArticleService } from './services/article.service';
import { EmployeeService } from './services/employee.service';
import { EmployeeTypeService } from './services/employee-type.service';
import { TableService } from './services/table.service';
import { CashBoxService } from './services/cash-box.service';
import { TransactionService } from './services/transaction.service';
import { TransactionTypeService } from './services/transaction-type.service';
import { MovementOfArticleService } from './services/movement-of-article.service';
import { UserService } from './services/user.service';
import { RoomService } from './services/room.service';
import { MakeService } from './services/make.service';
import { CategoryService } from './services/category.service';
import { TurnService } from './services/turn.service';
import { CompanyService } from './services/company.service';
import { ClockService } from './services/clock.service';
import { PrinterService } from './services/printer.service';
import { ImportService } from './services/import.service';
import { ConfigService } from './services/config.service';
import { PaymentMethodService } from './services/payment-method.service';
import { EmailService } from './services/send-email.service';
import { MovementOfCashService } from './services/movement-of-cash.service';
import { PrintService } from './services/print.service';
import { VATConditionService } from './services/vat-condition.service';
import { ArticleStockService } from './services/article-stock.service';
import { VariantTypeService } from './services/variant-type.service';
import { VariantService } from './services/variant.service';
import { TaxService } from './services/tax.service';
import { VariantValueService } from './services/variant-value.service';
import { DepositService } from './services/deposit.service';
import { LocationService } from './services/location.service';
import { CompanyNewsService } from './services/company-news.service';
import { ArticleFieldService } from './services/article-field.service';
import { CompanyGroupService } from "./services/company-group.service";
import { CompanyContactService } from "./services/company-contact.service";
import { CompanyFieldService } from './services/company-field.service';
import { BankService } from './services/bank.service';
import { PriceListService } from './services/price-list.service'

// guards
import { AuthGuard } from './guards/auth.guard';

// componentes
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';
import { ListEmployeesComponent } from './components/list-employees/list-employees.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { UpdateEmployeeComponent } from './components/update-employee/update-employee.component';
import { DeleteEmployeeComponent } from './components/delete-employee/delete-employee.component';
import { ListTablesComponent } from './components/list-tables/list-tables.component';
import { TableComponent } from './components/table/table.component';
import { ListCashBoxesComponent } from './components/list-cash-boxes/list-cash-boxes.component';
import { DeleteCashBoxComponent } from './components/delete-cash-box/delete-cash-box.component';
import { ListTransactionsComponent } from './components/list-transactions/list-transactions.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { DeleteTransactionComponent } from './components/delete-transaction/delete-transaction.component';
import { ListRoomsComponent } from './components/list-rooms/list-rooms.component';
import { DeleteRoomComponent } from './components/delete-room/delete-room.component';
import { UpdateRoomComponent } from './components/update-room/update-room.component';
import { AddRoomComponent } from './components/add-room/add-room.component';
import { ListMakesComponent } from './components/list-makes/list-makes.component';
import { AddMakeComponent } from './components/add-make/add-make.component';
import { DeleteMakeComponent } from './components/delete-make/delete-make.component';
import { UpdateMakeComponent } from './components/update-make/update-make.component';
import { ListCategoriesComponent } from './components/list-categories/list-categories.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { UpdateCategoryComponent } from './components/update-category/update-category.component';
import { DeleteCategoryComponent } from './components/delete-category/delete-category.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';
import { DeleteCompanyComponent } from './components/delete-company/delete-company.component';
import { AddCompanyComponent } from './components/add-company/add-company.component';
import { ListEmployeeTypesComponent } from './components/list-employee-types/list-employee-types.component';
import { UpdateEmployeeTypeComponent } from './components/update-employee-type/update-employee-type.component';
import { DeleteEmployeeTypeComponent } from './components/delete-employee-type/delete-employee-type.component';
import { AddEmployeeTypeComponent } from './components/add-employee-type/add-employee-type.component';
import { PrinterComponent } from './components/printer/printer.component';
import { ListPrintersComponent } from './components/list-printers/list-printers.component';
import { AddMovementOfCashComponent } from './components/add-movement-of-cash/add-movement-of-cash.component';
import { AddArticleStockComponent } from './components/add-article-stock/add-article-stock.component';
import { ConfigComponent } from './components/config/config.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { SelectEmployeeComponent } from './components/select-employee/select-employee.component';
import { PrintComponent } from './components/print/print/print.component';
import { ViewTransactionComponent } from './components/view-transaction/view-transaction.component';
import { ListTurnsComponent } from './components/list-turns/list-turns.component';
import { ListTransactionTypesComponent } from './components/list-transaction-types/list-transaction-types.component';
import { AddTransactionTypeComponent } from './components/add-transaction-type/add-transaction-type.component';
import { DeleteTransactionTypeComponent } from './components/delete-transaction-type/delete-transaction-type.component';
import { ExportCitiComponent } from './components/export/export-citi/export-citi.component';
import { UpdateArticleStockComponent } from './components/update-article-stock/update-article-stock.component';
import { ListArticleStocksComponent } from './components/list-article-stocks/list-article-stocks.component';
import { AddVariantComponent } from './components/add-variant/add-variant.component';
import { DeleteVariantComponent } from './components/delete-variant/delete-variant.component';
import { ListVariantsComponent } from './components/list-variants/list-variants.component';
import { AddVariantTypeComponent } from './components/add-variant-type/add-variant-type.component';
import { UpdateVariantTypeComponent } from './components/update-variant-type/update-variant-type.component';
import { DeleteVariantTypeComponent } from './components/delete-variant-type/delete-variant-type.component';
import { ListVariantTypesComponent } from './components/list-variant-types/list-variant-types.component';
import { ListVariantValuesComponent } from './components/list-variant-values/list-variant-values.component';
import { DeleteVariantValueComponent } from './components/delete-variant-value/delete-variant-value.component';
import { UpdateVariantValueComponent } from './components/update-variant-value/update-variant-value.component';
import { AddVariantValueComponent } from './components/add-variant-value/add-variant-value.component';
import { AddMovementOfArticleComponent } from './components/add-movement-of-article/add-movement-of-article.component';
import { AddArticleTaxComponent } from './components/add-article-tax/add-article-tax.component';
import { AddTaxComponent } from './components/add-tax/add-tax.component';
import { DeleteTaxComponent } from './components/delete-tax/delete-tax.component';
import { ListTaxesComponent } from './components/list-taxes/list-taxes.component';
import { ApplyDiscountComponent } from './components/apply-discount/apply-discount.component';
import { PaymentMethodComponent } from './components/payment-method/payment-method.component';
import { ListPaymentMethodsComponent } from './components/list-payment-methods/list-payment-methods.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { LoginComponent } from './components/login/login.component';
import { ClockComponent } from './components/clock/clock.component';
import { ImportComponent } from './components/import/import.component';
import { RegisterComponent } from './components/register/register.component';
import { LicensePaymentComponent } from './components/license-payment/license-payment.component'

// pipes
import { FilterPipe } from './pipes/filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { TotalPipe } from './pipes/total.pipe';
import { RoundNumberPipe } from './pipes/round-number.pipe';

// directives
import { FocusDirective } from './directives/focus.directive';
import { DeleteMovementOfCashComponent } from './components/delete-movement-of-cash/delete-movement-of-cash.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { ListDepositsComponent } from './components/list-deposits/list-deposits.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { CashBoxComponent } from './components/cash-box/cash-box.component';
import { LocationComponent } from './components/location/location.component';
import { ListLocationsComponent } from './components/list-locations/list-locations.component';
import { CompanyNewsComponent } from './components/company-news/company-news.component';
import { ListMovementOfCashesComponent } from './components/list-movements-of-cashes/list-movements-of-cashes.component';
import { AddArticleFieldComponent } from './components/add-article-field/add-article-field.component';
import { UpdateArticleFieldComponent } from './components/update-article-field/update-article-field.component';
import { DeleteArticleFieldComponent } from './components/delete-article-field/delete-article-field.component';
import { ListArticleFieldsComponent } from './components/list-article-fields/list-article-fields.component';
import { AddArticleFieldsComponent } from './components/add-article-fields/add-article-fields.component';
import { ListSummaryOfAccountsComponent } from './components/list-summary-of-accounts/list-summary-of-accounts.component';
import { ListVATConditionsComponent } from './components/list-vat-conditions/list-vat-conditions.component';
import { ExportIvaComponent } from './components/export/export-iva/export-iva.component';
import { ListCompaniesGroupComponent } from './components/list-companies-group/list-companies-group.component';
import { AddCompanyGroupComponent } from './components/add-company-group/add-company-group.component';
import { DeleteCompanyGroupComponent } from './components/delete-company-group/delete-company-group.component';
import { UpdateCompanyGroupComponent } from './components/update-company-group/update-company-group.component';
import { UpdateArticlePriceComponent } from './components/update-article-price/update-article-price.component';
import { CompanyContactComponent } from './components/company-contact/company-contact.component';
import { Config } from './app.config';
import { DeleteVATConditionComponent } from './components/delete-vat-condition/delete-vat-condition.component';
import { VATConditionComponent } from './components/vat-condition/vat-condition.component';
import { ReportBirthdayComponent } from './components/report-birthday/report-birthday.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component'
import { ListUnitsOfMeasurementComponent } from './components/list-units-of-measurement/list-units-of-measurement.component';
import { AddUnitOfMeasurementComponent } from './components/add-unit-of-measurement/add-unit-of-measurement.component';
import { DeleteUnitOfMeasurementComponent } from './components/delete-unit-of-measurement/delete-unit-of-measurement.component';
import { UnitOfMeasurementService } from './services/unit-of-measurement.service';
import { ListIdentificationTypesComponent } from './components/list-identification-types/list-identification-types.component';
import { AddIdentificationTypeComponent } from './components/add-identification-type/add-identification-type.component';
import { DeleteIdentificationTypeComponent } from './components/delete-identification-type/delete-identification-type.component';
import { IdentificationTypeService } from './services/identification-type.service';
import { UseOfCFDIService } from './services/use-of-CFDI.service';
import { AddUseOfCFDIComponent } from './components/add-use-of-CFDI.component.ts/add-use-of-CFDI.component';
import { DeleteUseOfCFDIComponent } from './components/delete-use-of-CFDI/delete-use-of-CFDI.component';
import { ListUsesOfCFDIComponent } from './components/list-uses-of-CFDI/list-uses-of-CFDI.component';
import { ListRelationTypesComponent } from './components/list-relation-types/list-relation-types.component';
import { AddRelationTypeComponent } from './components/add-relation-type/add-relation-type.component';
import { DeleteRelationTypeComponent } from './components/delete-relation-type/delete-relation-type.component';
import { RelationTypeService } from './services/relation-type.service';
import { StateService } from './services/state.service';

import { AddCompanyFieldComponent } from './components/add-company-field/add-company-field.component';
import { UpdateCompanyFieldComponent } from './components/update-company-field/update-company-field.component';
import { DeleteCompanyFieldComponent } from './components/delete-company-field/delete-company-field.component';
import { ListCompanyFieldsComponent } from './components/list-company-fields/list-company-fields.component';
import { AddCompanyFieldsComponent } from './components/add-company-fields/add-company-fields.component';
import { CancellationTypeComponent } from './components/cancellation-type/cancellation-type.component';
import { ListCancellationTypeComponent } from './components/list-cancellation-types/list-cancellation-types.component';
import { CancellationTypeService } from './services/cancellation-type.service';
import { RouterModule } from '@angular/router';
import { MovementOfCancellationComponent } from "./components/movement-of-cancellation/movement-of-cancellation.component";
import { MovementOfCancellationService } from './services/movement-of-cancellation.service';
import { CurrencyComponent } from './components/currency/currency.component';
import { ListCurrenciesComponent } from './components/list-currencies/list-currencies.component';
import { CurrencyService } from './services/currency.service';
import { ReportKardexComponent } from './components/report-kardex/report-kardex.component';
import { StateComponent } from './components/state/state.component';
import { ListStatesComponent } from './components/list-states/list-states.component';
import { CountryComponent } from './components/country/country.component';
import { ListCountriesComponent } from './components/list-countries/list-countries.component';
import { CountryService } from './services/country.service';
import { BankComponent } from './components/bank/bank.component';
import { ListBankComponent } from './components/list-bank/list-bank.component';
import { AuthService } from './services/auth.service';
import { BranchComponent } from './components/branch/branch.component';
import { ListBranchComponent } from './components/list-branches/list-branches.component';
import { BranchService } from './services/branch.service';
import { ListOriginsComponent } from './components/list-origins/list-origins.component';
import { OriginService } from './services/origin.service';
import { OriginComponent } from './components/origin/origin.component';
import { SelectBranchComponent } from './components/select-branch/select-branch.component';
import { SelectOriginComponent } from './components/select-origin/select-origin.component';
import { ClaimService } from './services/claim.service';
import { ClaimComponent } from './components/claim/claim.component';
import { TransportComponent } from './components/transport/transport.component';
import { TransportService } from './services/transport.service';
import { ListTransportComponent } from './components/list-transports/list-transports.component';
import { SelectTransportComponent } from './components/select-transport/select-transport.component';
import { PrintPriceListComponent } from './components/print/print-price-list/print-price-list.component';
import { ListCashBoxComponent } from './components/list-cash-box/list-cash-box.component';
import { CurrentAccountDetailsComponent } from './components/print/current-account-details/current-account-details.component';
import { PrintArticlesStockComponent } from './components/print/print-articles-stock/print-articles-stock.component';
import { PriceListComponent } from './components/price-list/price-list.component';
import { ListPriceListsComponent } from './components/list-price-lists/list-price-lists.component';
import { ListArticlesPosComponent } from './components/list-articles-pos/list-articles-pos.component';
import { ExportTransactionsComponent } from './components/export/export-transactions/export-transactions.component';
import { SelectDepositComponent } from './components/select-deposit/select-deposit.component';
import { EditCheckComponent } from './components/edit-check/edit-check.component';
import { PrintVatBookComponent } from './components/print/print-vat-book/print-vat-book.component';
import { PrintLabelComponent } from './components/print/print-label/print-label.component';
import { PrintTransactionTypeComponent } from './components/print/print-transaction-type/print-transaction-type.component';
import { ProgressbarComponent } from './components/progressbar/progressbar.component';
import { ReportsList } from './components/reports-list/reports-list.component';
import { ShortcutComponent } from './components/shortcut/shortcut.component';
import { LicenseGuard } from './guards/license.guard';
import { StructureService } from './services/structure.service';
import { StructureComponent } from './components/structure/structure.component';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ExportExcelComponent } from './components/export/export-excel/export-excel.component';
import { ClassificationComponent } from './components/classification/classification.component';
import { ListClassificationsComponent } from './components/list-classifications/list-classifications.component';
import { ClassificationService } from './services/classification.service';
import { ListMovementsOfArticlesComponent } from './components/list-movements-of-articles/list-movements-of-articles.component';

// const configSocket: SocketIoConfig = { url: "http://localhost:300", options: {} }; // TEST
const configSocket: SocketIoConfig = { url: "http://demo.poscloud.com.ar:300", options: {} }; // PROD

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    DeleteArticleComponent,
    ListEmployeesComponent,
    AddEmployeeComponent,
    UpdateEmployeeComponent,
    DeleteEmployeeComponent,
    ListTablesComponent,
    TableComponent,
    ListCashBoxesComponent,
    DeleteCashBoxComponent,
    ListTransactionsComponent,
    AddSaleOrderComponent,
    DeleteTransactionComponent,
    FocusDirective,
    ListRoomsComponent,
    AddRoomComponent,
    DeleteRoomComponent,
    UpdateRoomComponent,
    ListMakesComponent,
    ListVATConditionsComponent,
    DeleteVATConditionComponent,
    VATConditionComponent,
    AddMakeComponent,
    DeleteMakeComponent,
    UpdateMakeComponent,
    ListCategoriesComponent,
    AddCategoryComponent,
    UpdateCategoryComponent,
    DeleteCategoryComponent,
    PointOfSaleComponent,
    LoginComponent,
    FilterPipe,
    OrderByPipe,
    DateFormatPipe,
    TotalPipe,
    RoundNumberPipe,
    AddUserComponent,
    ListUsersComponent,
    DeleteUserComponent,
    ListCompaniesComponent,
    DeleteCompanyComponent,
    AddCompanyComponent,
    ClockComponent,
    AddEmployeeTypeComponent,
    UpdateEmployeeTypeComponent,
    DeleteEmployeeTypeComponent,
    ListEmployeeTypesComponent,
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
    ListTurnsComponent,
    ListTransactionTypesComponent,
    AddTransactionTypeComponent,
    DeleteTransactionTypeComponent,
    RegisterComponent,
    ExportCitiComponent,
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
    AddTaxComponent,
    DeleteTaxComponent,
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
    AddArticleFieldsComponent,
    ListSummaryOfAccountsComponent,
    ExportIvaComponent,
    ListCompaniesGroupComponent,
    AddCompanyGroupComponent,
    UpdateCompanyGroupComponent,
    DeleteCompanyGroupComponent,
    UpdateArticlePriceComponent,
    CompanyContactComponent,
    ListUnitsOfMeasurementComponent,
    AddUnitOfMeasurementComponent,
    DeleteUnitOfMeasurementComponent,
    ListIdentificationTypesComponent,
    AddIdentificationTypeComponent,
    DeleteIdentificationTypeComponent,
    AddUseOfCFDIComponent,
    DeleteUseOfCFDIComponent,
    ListUsesOfCFDIComponent,
    ListRelationTypesComponent,
    AddRelationTypeComponent,
    DeleteRelationTypeComponent,
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
    ExportTransactionsComponent,
    SelectDepositComponent,
    EditCheckComponent,
    PrintVatBookComponent,
    PrintLabelComponent,
    PrintTransactionTypeComponent,
    ProgressbarComponent,
    ReportsList,
    ShortcutComponent,
    StructureComponent,
    ListStructureComponent,
    ExportExcelComponent,
    ClassificationComponent,
    ListClassificationsComponent,
    ListMovementsOfArticlesComponent,
  ],
  entryComponents: [
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    DeleteArticleComponent,
    ListEmployeesComponent,
    AddEmployeeComponent,
    UpdateEmployeeComponent,
    DeleteEmployeeComponent,
    ListTablesComponent,
    TableComponent,
    ListCashBoxesComponent,
    DeleteCashBoxComponent,
    ListTransactionsComponent,
    AddSaleOrderComponent,
    DeleteTransactionComponent,
    ListRoomsComponent,
    AddRoomComponent,
    DeleteRoomComponent,
    UpdateRoomComponent,
    ListMakesComponent,
    ListVATConditionsComponent,
    DeleteVATConditionComponent,
    VATConditionComponent,
    AddMakeComponent,
    DeleteMakeComponent,
    UpdateMakeComponent,
    ListCategoriesComponent,
    AddCategoryComponent,
    UpdateCategoryComponent,
    DeleteCategoryComponent,
    PointOfSaleComponent,
    LoginComponent,
    AddUserComponent,
    ListUsersComponent,
    DeleteUserComponent,
    ListCompaniesComponent,
    DeleteCompanyComponent,
    AddCompanyComponent,
    ClockComponent,
    AddEmployeeTypeComponent,
    UpdateEmployeeTypeComponent,
    DeleteEmployeeTypeComponent,
    ListEmployeeTypesComponent,
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
    ListTurnsComponent,
    ListTransactionTypesComponent,
    AddTransactionTypeComponent,
    DeleteTransactionTypeComponent,
    RegisterComponent,
    ExportCitiComponent,
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
    AddTaxComponent,
    DeleteTaxComponent,
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
    AddArticleFieldsComponent,
    ListSummaryOfAccountsComponent,
    ExportIvaComponent,
    ListCompaniesGroupComponent,
    AddCompanyGroupComponent,
    UpdateCompanyGroupComponent,
    DeleteCompanyGroupComponent,
    UpdateArticlePriceComponent,
    CompanyContactComponent,
    ListUnitsOfMeasurementComponent,
    AddUnitOfMeasurementComponent,
    DeleteUnitOfMeasurementComponent,
    ListIdentificationTypesComponent,
    AddIdentificationTypeComponent,
    DeleteIdentificationTypeComponent,
    AddUseOfCFDIComponent,
    DeleteUseOfCFDIComponent,
    ListUsesOfCFDIComponent,
    ListRelationTypesComponent,
    AddRelationTypeComponent,
    DeleteRelationTypeComponent,
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
    ExportTransactionsComponent,
    SelectDepositComponent,
    EditCheckComponent,
    PrintVatBookComponent,
    PrintLabelComponent,
    PrintTransactionTypeComponent,
    ProgressbarComponent,
    ReportsList,
    ShortcutComponent,
    StructureComponent,
    ExportExcelComponent,
    ClassificationComponent,
    ListMovementsOfArticlesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(_routes, { useHash: true}),
    NgbModule,
    NgbCollapseModule,
    NgxPaginationModule,
    HttpClientModule,
    DragDropModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    SocketIoModule.forRoot(configSocket),
    ToastrModule.forRoot(),
  ],
  providers: [
    NgbActiveModal,
    NgbAlertConfig,
    ArticleService,
    EmployeeService,
    EmployeeTypeService,
    TableService,
    CashBoxService,
    TransactionService,
    TransactionTypeService,
    MovementOfArticleService,
    UserService,
    RoomService,
    MakeService,
    CategoryService,
    TurnService,
    CompanyService,
    ClockService,
    PrinterService,
    ImportService,
    ConfigService,
    PaymentMethodService,
    MovementOfCashService,
    PrintService,
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
    UnitOfMeasurementService,
    IdentificationTypeService,
    UseOfCFDIService,
    RelationTypeService,
    CompanyFieldService,
    CancellationTypeService,
    MovementOfCancellationService,
    CurrencyService,
    RoundNumberPipe,
    StateService,
    CountryService,
    BankService,
    BranchService,
    AuthGuard,
    LicenseGuard,
    AuthService,
    OriginService,
    ClaimService,
    TransportService,
    PriceListService,
    StructureService,
    ClassificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

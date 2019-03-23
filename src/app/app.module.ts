import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

// paquetes de terceros
import { NgbModule, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap'; // https://ng-bootstrap.github.io/
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { PushNotificationComponent } from './../app/components/notification/notification.component';

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
import { MailService } from './services/send-mail.service';
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
import { CompanyFieldService } from './services/company-field.service'

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
import { AddTableComponent } from './components/add-table/add-table.component';
import { UpdateTableComponent } from './components/update-table/update-table.component';
import { DeleteTableComponent } from './components/delete-table/delete-table.component';
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
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';
import { DeleteCompanyComponent } from './components/delete-company/delete-company.component';
import { AddCompanyComponent } from './components/add-company/add-company.component';
import { ListEmployeeTypesComponent } from './components/list-employee-types/list-employee-types.component';
import { UpdateEmployeeTypeComponent } from './components/update-employee-type/update-employee-type.component';
import { DeleteEmployeeTypeComponent } from './components/delete-employee-type/delete-employee-type.component';
import { AddEmployeeTypeComponent } from './components/add-employee-type/add-employee-type.component';
import { AddPrinterComponent } from './components/add-printer/add-printer.component';
import { DeletePrinterComponent } from './components/delete-printer/delete-printer.component';
import { UpdatePrinterComponent } from './components/update-printer/update-printer.component';
import { ListPrintersComponent } from './components/list-printers/list-printers.component';
import { AddMovementOfCashComponent } from './components/add-movement-of-cash/add-movement-of-cash.component';
import { AddArticleStockComponent } from './components/add-article-stock/add-article-stock.component';
import { ConfigBackupComponent } from './components/config-backup/config-backup.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { SendMailComponent } from './components/send-mail/send-mail.component';
import { SelectEmployeeComponent } from './components/select-employee/select-employee.component';
import { PrintComponent } from './components/print/print.component';
import { ViewTransactionComponent } from './components/view-transaction/view-transaction.component';
import { ListTurnsComponent } from './components/list-turns/list-turns.component';
import { ListTransactionTypesComponent } from './components/list-transaction-types/list-transaction-types.component';
import { AddTransactionTypeComponent } from './components/add-transaction-type/add-transaction-type.component';
import { DeleteTransactionTypeComponent } from './components/delete-transaction-type/delete-transaction-type.component';
import { ExportCitiComponent } from './components/export-citi/export-citi.component';
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
import { UpdateTaxComponent } from './components/update-tax/update-tax.component';
import { DeleteTaxComponent } from './components/delete-tax/delete-tax.component';
import { ListTaxesComponent } from './components/list-taxes/list-taxes.component';
import { ApplyDiscountComponent } from './components/apply-discount/apply-discount.component';
import { AddPaymentMethodComponent } from './components/add-payment-method/add-payment-method.component';
import { UpdatePaymentMethodComponent } from './components/update-payment-method/update-payment-method.component';
import { DeletePaymentMethodComponent } from './components/delete-payment-method/delete-payment-method.component';
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
import { AddDepositComponent } from './components/add-deposit/add-deposit.component';
import { ListDepositsComponent } from './components/list-deposits/list-deposits.component';
import { UpdateDepositComponent } from './components/update-deposit/update-deposit.component';
import { DeleteDepositComponent } from './components/delete-deposit/delete-deposit.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { CashBoxComponent } from './components/cash-box/cash-box.component';
import { AddLocationComponent } from './components/add-location/add-location.component';
import { UpdateLocationComponent } from './components/update-location/update-location.component';
import { DeleteLocationComponent } from './components/delete-location/delete-location.component';
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
import { ExportIvaComponent } from './components/export-iva/export-iva.component';
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

import { AddCompanyFieldComponent } from './components/add-company-field/add-company-field.component';
import { UpdateCompanyFieldComponent } from './components/update-company-field/update-company-field.component';
import { DeleteCompanyFieldComponent } from './components/delete-company-field/delete-company-field.component';
import { ListCompanyFieldsComponent } from './components/list-company-fields/list-company-fields.component';
import { AddCompanyFieldsComponent } from './components/add-company-fields/add-company-fields.component';
import { from } from 'rxjs/observable/from';
import { CancellationTypeComponent } from './components/cancellation-type/cancellation-type.component';
import { ListCancellationTypeComponent } from './components/list-cancellation-types/list-cancellation-types.component';
import { CancellationTypeService } from './services/cancellation-type.service';
import { RouterModule } from '@angular/router';
// const config: SocketIoConfig = { url: "http://localhost:3000", options: {} };

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
    AddTableComponent,
    UpdateTableComponent,
    DeleteTableComponent,
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
    UpdateUserComponent,
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
    AddPrinterComponent,
    DeletePrinterComponent,
    UpdatePrinterComponent,
    ListPrintersComponent,
    AddMovementOfCashComponent,
    ImportComponent,
    ConfigBackupComponent,
    AddTransactionComponent,
    CurrentAccountComponent,
    SendMailComponent,
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
    UpdateTaxComponent,
    DeleteTaxComponent,
    ListTaxesComponent,
    ApplyDiscountComponent,
    AddPaymentMethodComponent,
    UpdatePaymentMethodComponent,
    DeletePaymentMethodComponent,
    ListPaymentMethodsComponent,
    DeleteMovementOfCashComponent,
    StatisticsComponent,
    AddDepositComponent,
    ListDepositsComponent,
    UpdateDepositComponent,
    DeleteDepositComponent,
    ReportBestSellingArticleComponent,
    ReportSalesByPaymentMethodComponent,
    ReportSalesByClientComponent,
    ReportSalesByMakeComponent,
    ReportSalesByCategoryComponent,
    ReportBirthdayComponent,
    ReportSalesByEmployeeComponent,
    CashBoxComponent,
    AddLocationComponent,
    UpdateLocationComponent,
    DeleteLocationComponent,
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
    ListCancellationTypeComponent
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
    AddTableComponent,
    UpdateTableComponent,
    DeleteTableComponent,
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
    UpdateUserComponent,
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
    AddPrinterComponent,
    DeletePrinterComponent,
    UpdatePrinterComponent,
    ListPrintersComponent,
    AddMovementOfCashComponent,
    ImportComponent,
    ConfigBackupComponent,
    AddTransactionComponent,
    CurrentAccountComponent,
    SendMailComponent,
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
    UpdateTaxComponent,
    DeleteTaxComponent,
    ListTaxesComponent,
    ApplyDiscountComponent,
    AddPaymentMethodComponent,
    UpdatePaymentMethodComponent,
    DeletePaymentMethodComponent,
    ListPaymentMethodsComponent,
    DeleteMovementOfCashComponent,
    StatisticsComponent,
    AddDepositComponent,
    ListDepositsComponent,
    UpdateDepositComponent,
    DeleteDepositComponent,
    ReportBestSellingArticleComponent,
    ReportSalesByPaymentMethodComponent,
    ReportSalesByClientComponent,
    ReportSalesByMakeComponent,
    ReportSalesByCategoryComponent,
    ReportBirthdayComponent,
    ReportSalesByEmployeeComponent,
    CashBoxComponent,
    AddLocationComponent,
    UpdateLocationComponent,
    DeleteLocationComponent,
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
    CancellationTypeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(_routes, { useHash: true}),
    NgbModule.forRoot(),
    NgxPaginationModule,
    ChartsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    NgxChartsModule,
    HttpClientModule,
    // SocketIoModule.forRoot(config),
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
    AuthGuard,
    MailService,
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
    CancellationTypeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

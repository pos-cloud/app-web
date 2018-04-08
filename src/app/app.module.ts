import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

//paquetes de terceros
import { NgbModule, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';//https://ng-bootstrap.github.io/
import { NgxPaginationModule } from 'ngx-pagination';//https://www.npmjs.com/package/ngx-pagination

//rutas
import { RoutingModule } from './app.routes';

//servicios
import { ArticleService } from './services/article.service';
import { EmployeeService } from './services/employee.service';
import { EmployeeTypeService } from './services/employee-type.service';
import { TableService } from './services/table.service';
import { CashBoxService } from './services/cash-box.service';
import { TransactionService } from './services/transaction.service';
import { TransactionTypeService } from './services/transaction-type.service';
import { MovementOfArticleService } from "./services/movement-of-article.service";
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

//guards
import { AuthGuard } from './guards/auth.guard';

//componentes
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
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
import { AddCashBoxComponent } from './components/add-cash-box/add-cash-box.component';
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
import { UpdateCompanyComponent } from './components/update-company/update-company.component';
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

import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { LoginComponent } from './components/login/login.component';
import { ClockComponent } from './components/clock/clock.component';
import { ImportComponent } from './components/import/import.component';
import { RegisterComponent } from './components/register/register.component';

//pipes
import { FilterPipe } from './pipes/filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { TotalPipe } from './pipes/total.pipe';
import { RoundNumberPipe } from './pipes/round-number.pipe';

//directives
import { FocusDirective } from './directives/focus.directive';
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
import { UpdateTransactionTypeComponent } from './components/update-transaction-type/update-transaction-type.component';
import { DeleteTransactionTypeComponent } from './components/delete-transaction-type/delete-transaction-type.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    UpdateArticleComponent,
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
    AddCashBoxComponent,
    ListTransactionsComponent,
    AddSaleOrderComponent,
    DeleteTransactionComponent,
    FocusDirective,
    ListRoomsComponent,
    AddRoomComponent,
    DeleteRoomComponent,
    UpdateRoomComponent,
    ListMakesComponent,
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
    UpdateCompanyComponent,
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
    UpdateTransactionTypeComponent,
    DeleteTransactionTypeComponent,
    RegisterComponent
  ],
  entryComponents: [
    AddMovementOfCashComponent,
    SelectEmployeeComponent,
    PrintComponent,
    ViewTransactionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RoutingModule,
    NgbModule.forRoot(),
    NgxPaginationModule
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
    VATConditionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

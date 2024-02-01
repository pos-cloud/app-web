import * as express from 'express'

import BusinessRulesController from '../domains/business-rule/business-rule.controller'
import MovementOfCashController from '../domains/movement-of-cash/movement-of-cash.controller'
//import SMSController from '../domains/uc/sms.controller'
//import WhatsappController from '../domains/uc/whatsapp.controller'
import WooCommerceController from '../domains/uc/woocomerce.controller'

import AuthenticationController from './../authentication/authentication.controller'
import AccountPeriodController from './../domains/account-period/account-period.controller'
import AccountSeatController from './../domains/account-seat/account-seat.controller'
import AccountController from './../domains/account/account.controller'
import AddressController from './../domains/address/address.controller'
import ApplicationController from './../domains/application/application.controller'
import ArticleFieldController from './../domains/article-field/article-field.controller'
import ArticleStockController from './../domains/article-stock/article-stock.controller'
import ArticleController from './../domains/article/article.controller'
import BankController from './../domains/bank/bank.controller'
import BranchController from './../domains/branch/branch.controller'
import CancellationTypeController from './../domains/cancellation-type/cancellation-type.controller'
import CashBoxTypeController from './../domains/cash-box-type/cash-box-type.controller'
import CashBoxController from './../domains/cash-box/cash-box.controller'
import CategoryController from './../domains/category/category.controller'
import ClaimController from './../domains/claim/claim.controller'
import ClassificationController from './../domains/classification/classification.controller'
import CompanyConctactController from './../domains/company-contact/company-contact.controller'
import CompanyFieldsController from './../domains/company-field/company-field.controller'
import CompanyGroupController from './../domains/company-group/company-group.controller'
import CompanyNewController from './../domains/company-new/company-new.controller'
import CompanyController from './../domains/company/company.controller'
import ConfigController from './../domains/config/config.controller'
import CountryController from './../domains/country/country.controller'
import CurrencyController from './../domains/currency/currency.controller'
import DatabaseController from './../domains/database/database.controller'
import DepositController from './../domains/deposit/deposit.controller'
import EmailTemplateController from './../domains/email-template/email-template.controller'
import EmployeeTypeController from './../domains/employee-type/employee-type.controller'
import EmployeeController from './../domains/employee/employee.controller'
import FileController from './../domains/file/file.controller'
import GalleryController from './../domains/gallery/gallery.controller'
import HistoryController from './../domains/history/history.controller'
import HolidayController from './../domains/holiday/holiday.controller'
import IdentificationTypeController from './../domains/identification-type/identification-type.controller'
import LocationController from './../domains/location/location.controller'
import MakeController from './../domains/make/make.controller'
import MovementOfArticleController from './../domains/movement-of-article/movement-of-article.controller'
import MovementOfCancellationController from './../domains/movement-of-cancellation/movement-of-cancellation.controller'
import MovementOfCashBoxController from './../domains/movement-of-cash-box/movement-of-cash-box.controller'
import OriginController from './../domains/origin/origin.controller'
import PaymentMethodController from './../domains/payment-method/payment-method.controller'
import PermissionController from './../domains/permission/permission.controller'
import PriceListController from './../domains/price-list/price-list.controller'
import PrintController from './../domains/print/print.controller'
import PrinterController from './../domains/printer/printer.controller'
import RelationTypeController from './../domains/relation-type/relation-type.controller'
import ReportController from './../domains/report/report.controller'
import ReservationController from './../domains/reservation/reservation.controller'
import ResourceController from './../domains/resource/resource.controller'
import RoomController from './../domains/room/room.controller'
import SessionController from './../domains/session/session.controller'
import ShipmentMethodController from './../domains/shipment-method/shipment-method.controller'
import StateController from './../domains/state/state.controller'
import StructureController from './../domains/structure/structure.controller'
import TableController from './../domains/table/table.controller'
import TaxController from './../domains/tax/tax.controller'
import TransactionTypeController from './../domains/transaction-type/transaction-type.controller'
import TransactionController from './../domains/transaction/transaction.controller'
import AccountSeatTransactionController from './../domains/uc/account-seat-transaction'
import MercadoLibreController from './../domains/uc/mercadolibre.controller'
import OrderNumberController from './../domains/uc/orderNumber'
import getSummaryCurrentAccount from './../domains/uc/report-current-account'
import StockController from './../domains/uc/stock.controller'
import UnitOfMeasurementController from './../domains/unit-of-measurement/unit-of-measurement.controller'
import UseOfCFDIController from './../domains/use-of-CFDI/use-of-CFDI.controller'
import UserController from './../domains/user/user.controller'
import VariantTypeController from './../domains/variant-type/variant-type.controller'
import VariantValueController from './../domains/variant-value/variant-value.controller'
import VariantController from './../domains/variant/variant.controller'
import VATConditionController from './../domains/vat-condition/vat-condition.controller'
import VoucherController from './../domains/voucher/voucher.controller'
import Controller from './../interfaces/controller.interface'
import TiendaNubeController from './../domains/uc/tienda-nube'
import MenuController from './../domains/menu/menu.controller'
import ArticleRequirementsByTransaccionController from '../domains/reports/reports.controller'

function initializeControllers(app: express.Application = null, database: string = null) {
  let controllers: Controller[] = [
    new OrderNumberController(),
    new getSummaryCurrentAccount(),
    new StockController(),
    new TiendaNubeController(),
    new AccountSeatTransactionController(),
    new CompanyController(database),
    new ReportController(database),
    //new WhatsappController(database),
    //new SMSController(database),
    new AuthenticationController(),
    new UserController(database),
    new EmployeeController(database),
    new EmployeeTypeController(database),
    new BranchController(database),
    new VATConditionController(database),
    new CountryController(database),
    new StateController(database),
    new IdentificationTypeController(database),
    new CompanyFieldsController(database),
    new CompanyGroupController(database),
    new PriceListController(database),
    new CategoryController(database),
    new MakeController(database),
    new ArticleController(database),
    new CashBoxTypeController(database),
    new OriginController(database),
    new UnitOfMeasurementController(database),
    new CurrencyController(database),
    new DepositController(database),
    new LocationController(database),
    new ClassificationController(database),
    new TaxController(database),
    new ArticleFieldController(database),
    new AddressController(database),
    new ApplicationController(database),
    new ArticleStockController(database),
    new BankController(database),
    new CancellationTypeController(database),
    new TransactionTypeController(database),
    new PaymentMethodController(database),
    new UseOfCFDIController(database),
    new ShipmentMethodController(database),
    new EmailTemplateController(database),
    new CashBoxController(database),
    new CompanyFieldsController(database),
    new ClaimController(database),
    new CompanyConctactController(database),
    new CompanyNewController(database),
    new ConfigController(database),
    new CurrencyController(database),
    new DatabaseController(database),
    new GalleryController(database),
    new ResourceController(database),
    new MovementOfArticleController(database),
    new TransactionController(database),
    new RelationTypeController(database),
    new TableController(database),
    new RoomController(database),
    new MovementOfCancellationController(database),
    new MovementOfCashController(database),
    new MovementOfCashBoxController(database),
    new PrintController(database),
    new ReservationController(database),
    new SessionController(database),
    new StructureController(database),
    new VariantController(database),
    new VariantTypeController(database),
    new VariantValueController(database),
    new PermissionController(database),
    new VoucherController(database),
    new HistoryController(database),
    new HolidayController(database),
    new PrinterController(database),
    new AccountController(database),
    new AccountPeriodController(database),
    new AccountSeatController(database),
    new FileController(),
    new WooCommerceController(null),
    new MercadoLibreController(null),
    new BusinessRulesController(database),
    new MenuController()
    new ArticleRequirementsByTransaccionController()
  ]

  if (app)
    controllers.forEach((controller) => {
      app.use('/', controller.router)
    })
}

export default initializeControllers

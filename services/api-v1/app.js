'use strict'

const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')

const articleRoutes = require('./routes/article.routes')
const employeeRoutes = require('./routes/employee.routes')
const employeeTypeRoutes = require('./routes/employee-type.routes')
const tableRoutes = require('./routes/table.routes')
const transactionRoutes = require('./routes/transaction.routes')
const cashBoxRoutes = require('./routes/cash-box.routes')
const cashBoxTypeRoutes = require('./routes/cash-box-type.routes')
const movementOfArticleRoutes = require('./routes/movement-of-article.routes')
const userRoutes = require('./routes/user.routes')
const roomRoutes = require('./routes/room.routes')
const makeRoutes = require('./routes/make.routes')
const categoryRoutes = require('./routes/category.routes')
const turnRoutes = require('./routes/turn.routes')
const companyRoutes = require('./routes/company.routes')
const printRoutes = require('./routes/print.routes')
const importRoutes = require('./routes/import.routes')
const printerRoutes = require('./routes/printer.routes')
const configRoutes = require('./routes/config.routes')
const transactionTypeRoutes = require('./routes/transaction-type.routes')
const paymentMethodRoutes = require('./routes/payment-method.routes')
const emailRoutes = require('./routes/email.routes')
const movementOfCashRoutes = require('./routes/movement-of-cash.routes')
const licenseRoutes = require('./routes/license.routes')
const utilitiesRoutes = require('./routes/utilities.routes')
const vatConditionRoutes = require('./routes/vat-condition.routes')
const barcodeRoutes = require('./routes/barcode.routes')
const registerRoutes = require('./routes/register.routes')
const fileRoutes = require('./routes/file.routes')
const articleStockRoutes = require('./routes/article-stock.routes')
const variantRoutes = require('./routes/variant.routes')
const variantTypeRoutes = require('./routes/variant-type.routes')
const variantValueRoutes = require('./routes/variant-value.routes')
const taxRoutes = require('./routes/tax.routes')
const depositRoutes = require('./routes/deposit.routes')
const locationRoutes = require('./routes/location.routes')
const companyNewsRoutes = require('./routes/company-news.routes')
const articleFieldRoutes = require('./routes/article-field.routes')
const companyGroupRoutes = require('./routes/company-group.routes')
const reservationRoutes = require('./routes/reservation.routes')
const companyContactRoutes = require('./routes/company-contact.routes')
const unitOfMeasurementRoutes = require('./routes/unit-of-measurement.routes')
const identificationTypeRoutes = require('./routes/identification-type.routes')
const useOfCFDIRoutes = require('./routes/use-of-CFDI.routes')
const relationTypeRoutes = require('./routes/relation-type.routes')
const companyFieldRoutes = require('./routes/company-field.routes')
const cancellationTypeRoutes = require('./routes/cancellation-type.routes')
const movementOfCancellationRoutes = require('./routes/movement-of-cancellation.routes')
const currencyRoutes = require('./routes/currency.routes')
const stateRoutes = require('./routes/state.routes')
const countryRoutes = require('./routes/country.routes')
const bankRoutes = require('./routes/bank.routes')
const branchRoutes = require('./routes/branch.routes')
const originRoutes = require('./routes/origin.routes')
const claimRoutes = require('./routes/claim.routes')
const transportRoutes = require('./routes/transport.routes')
const priceListRoutes = require('./routes/price-list.routes')
const authRoutes = require('./routes/auth.routes')
const structureRoutes = require('./routes/structure.routes')
const classificationRoutes = require('./routes/classification.routes')
const currencyValueRoutes = require('./routes/currency-value.routes')
const resourceRoutes = require('./routes/resource.routes')
const galleryRoutes = require('./routes/gallery.routes')
const emailTemplateRoutes = require('./routes/email-template.routes')
const voucherRoutes = require('./routes/voucher.routes')
const shipmentMethodRoutes = require('./routes/shipment-method.routes')
const applicationRoutes = require('./routes/application.routes')
const addressRoutes = require('./routes/address.routes')
const historyRoutes = require('./routes/hmodel.routes')

const app = express().use('*', cors())

app.use(bodyparser.json({ limit: '50mb' }))
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))

app.set('trust proxy', true)

app.use('/api',
  turnRoutes,
  articleRoutes,
  employeeRoutes,
  tableRoutes,
  transactionRoutes,
  cashBoxRoutes,
  cashBoxTypeRoutes,
  movementOfArticleRoutes,
  userRoutes,
  roomRoutes,
  makeRoutes,
  companyRoutes,
  categoryRoutes,
  printRoutes,
  employeeTypeRoutes,
  importRoutes,
  printerRoutes,
  configRoutes,
  transactionTypeRoutes,
  paymentMethodRoutes,
  emailRoutes,
  movementOfCashRoutes,
  licenseRoutes,
  utilitiesRoutes,
  vatConditionRoutes,
  barcodeRoutes,
  registerRoutes,
  fileRoutes,
  articleStockRoutes,
  variantRoutes,
  variantTypeRoutes,
  variantValueRoutes,
  taxRoutes,
  depositRoutes,
  locationRoutes,
  companyNewsRoutes,
  articleFieldRoutes,
  companyGroupRoutes,
  reservationRoutes,
  companyContactRoutes,
  unitOfMeasurementRoutes,
  identificationTypeRoutes,
  useOfCFDIRoutes,
  relationTypeRoutes,
  companyFieldRoutes,
  cancellationTypeRoutes,
  movementOfCancellationRoutes,
  currencyRoutes,
  stateRoutes,
  countryRoutes,
  bankRoutes,
  branchRoutes,
  originRoutes,
  claimRoutes,
  transportRoutes,
  priceListRoutes,
  authRoutes,
  structureRoutes,
  classificationRoutes,
  currencyValueRoutes,
  resourceRoutes,
  galleryRoutes,
  emailTemplateRoutes,
  voucherRoutes,
  shipmentMethodRoutes,
  applicationRoutes,
  addressRoutes,
  historyRoutes)

module.exports = app

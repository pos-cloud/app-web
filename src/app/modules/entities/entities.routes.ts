import { Routes } from '@angular/router';

export const ENTITIES_ROUTES: Routes = [
  {
    path: 'accounts',
    loadChildren: () => import('./account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'banks',
    loadChildren: () => import('./bank/bank.routes').then((m) => m.BANK_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () => import('./category/category.routes').then((m) => m.CATEGORY_ROUTES),
  },
  {
    path: 'currencies',
    loadChildren: () => import('./currency/currency.routes').then((m) => m.CURRENCY_ROUTES),
  },
  {
    path: 'currency-values',
    loadChildren: () => import('./currency-value/currency-value.routes').then((m) => m.CURRENCY_VALUE_ROUTES),
  },
  {
    path: 'employees',
    loadChildren: () => import('./employee/employee.routes').then((m) => m.EMPLOYEE_ROUTES),
  },
  {
    path: 'employee-types',
    loadChildren: () => import('./employee-type/employee-type.routes').then((m) => m.EMPLOYEE_TYPES_ROUTES),
  },
  {
    path: 'galleries',
    loadChildren: () => import('./gallery/gallery.routes').then((m) => m.GALLERY_ROUTES),
  },
  {
    path: 'makes',
    loadChildren: () => import('./make/make.routes').then((m) => m.MAKE_ROUTES),
  },
  {
    path: 'resources',
    loadChildren: () => import('./resource/resource.routes').then((m) => m.RESOURCE_ROUTES),
  },
  {
    path: 'rooms',
    loadChildren: () => import('./room/room.routes').then((m) => m.ROOM_ROUTES),
  },
  {
    path: 'tables',
    loadChildren: () => import('./table/table.routes').then((m) => m.TABLE_ROUTES),
  },
  {
    path: 'branches',
    loadChildren: () => import('./branch/branch.routes').then((m) => m.BRANCH_ROUTES),
  },
  {
    path: 'unit-of-measurements',
    loadChildren: () =>
      import('./unit-of-measurement/unit-of-measurements.routes').then((m) => m.UNIT_OF_MEASUREMENTS_ROUTES),
  },
  {
    path: 'variant-values',
    loadChildren: () => import('./variant-value/variant-value.routes').then((m) => m.VARIANT_VALUE_ROUTES),
  },
  {
    path: 'variant-types',
    loadChildren: () => import('./variant-type/variant-type.routes').then((m) => m.VARIANT_TYPE_ROUTES),
  },
  {
    path: 'articles',
    loadChildren: () => import('./article/article.routes').then((m) => m.ARTICLE_ROUTES),
  },
  {
    path: 'account-periods',
    loadChildren: () => import('./account-period/account-period.routes').then((m) => m.ACCOUNT_PERIOD_ROUTES),
  },
  {
    path: 'companies',
    loadChildren: () => import('./company/company.routes').then((m) => m.COMPANY_ROUTES),
  },
  {
    path: 'relation-type',
    loadChildren: () => import('./relation-type/relation-type.routes').then((m) => m.RELATION_TYPE_ROUTE),
  },
  {
    path: 'identification-type',
    loadChildren: () =>
      import('./identification-type/identification-type.routes').then((m) => m.IDENTIFICATION_TYPE_ROUTE),
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.routes').then((m) => m.LOCATION_ROUTES),
  },
  {
    path: 'deposit',
    loadChildren: () => import('./deposit/deposit.routes').then((m) => m.DEPOSIT_ROUTES),
  },
  {
    path: 'classification',
    loadChildren: () => import('./classification/classification.routes').then((m) => m.CLASSIFICATION_ROUTE),
  },
  {
    path: 'shipment-methods',
    loadChildren: () => import('./shipment-method/shipment-method.routes').then((m) => m.SHIPMENT_METHOD_ROUTES),
  },
  {
    path: 'structures',
    loadChildren: () => import('./structure/structure.routes').then((m) => m.STRUCTURE_ROUTES),
  },
  {
    path: 'article-stock',
    loadChildren: () => import('./article-stock/article-stock.routes').then((m) => m.ARTICLE_STOCK_ROUTES),
  },
  {
    path: 'company-groups',
    loadChildren: () => import('./company-group/company-group.routes').then((m) => m.COMPANY_GROUP_ROUTE),
  },
  {
    path: 'transports',
    loadChildren: () => import('./transport/transport.routes').then((m) => m.TRANSPORT_ROUTES),
  },
  {
    path: 'countries',
    loadChildren: () => import('./country/country.routes').then((m) => m.COUNTRY_ROUTES),
  },
  {
    path: 'printers',
    loadChildren: () => import('./printer/printer.routes').then((m) => m.PRINTER_ROUTES),
  },
  {
    path: 'permissions',
    loadChildren: () => import('./permission/permission.routes').then((m) => m.PERMISSION_ROUTES),
  },
  {
    path: 'uses-of-cfdi',
    loadChildren: () => import('./uses-of-cfdi/uses-of-cfdi.routes').then((m) => m.USES_OF_CFDI),
  },
  {
    path: 'holidays',
    loadChildren: () => import('./holiday/holiday.routes').then((m) => m.HOLIDAY),
  },
  {
    path: 'business-rules',
    loadChildren: () => import('./business-rules/business-rules.routes').then((m) => m.BUSINESS_RULES_ROUTES),
  },
  {
    path: 'price-list',
    loadChildren: () => import('./price-list/price-list.routes').then((m) => m.PRICE_LIST_ROUTES),
  },
  {
    path: 'cash-box-types',
    loadChildren: () => import('./cash-box-types/cash-box-types.routes').then((m) => m.CASH_BOX_TYPES_ROUTES),
  },
  {
    path: 'vat-condition',
    loadChildren: () => import('./vat-condition/vat-condition.routes').then((m) => m.VAT_CONDITION_ROUTES),
  },
  {
    path: 'applications',
    loadChildren: () => import('./applications/application.routes').then((m) => m.APPLICATION_ROUTES),
  },
  {
    path: 'config',
    loadChildren: () => import('./config/config.routes').then((m) => m.CONFIG_ROUTES),
  },
];

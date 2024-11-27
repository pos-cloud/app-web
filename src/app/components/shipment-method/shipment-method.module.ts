import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { AddressModule } from '../address/address.module';
import { DatatableModule } from '../datatable/datatable.module';
import { ShipmentMethodComponent } from './crud/shipment-method.component';
import { ListShipmentMethodsComponent } from './list-shipment-methods/list-shipment-methods.component';
import { SelectShipmentMethodComponent } from './select-shipment-method/select-shipment-method.component';

const routes: Routes = [
  {
    path: 'shipment-methods',
    component: ListShipmentMethodsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FocusDirective,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    AddressModule,
  ],
  declarations: [
    ListShipmentMethodsComponent,
    ShipmentMethodComponent,
    SelectShipmentMethodComponent,
  ],
  exports: [ShipmentMethodComponent, SelectShipmentMethodComponent],
  providers: [],
})
export class ShipmentMethodModule {}

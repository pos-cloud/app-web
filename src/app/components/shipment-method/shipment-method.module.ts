import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShipmentMethodComponent } from './crud/shipment-method.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { ShipmentMethodService } from './shipment-method.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { ListShipmentMethodsComponent } from './list-shipment-methods/list-shipment-methods.component';
import { AgmCoreModule } from '@agm/core';
import { SelectShipmentMethodComponent } from './select-shipment-method/select-shipment-method.component';

const routes: Routes = [
  {
    path: 'shipment-methods',
    component: ListShipmentMethodsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCi1AySMkCMeuptt0rwsgpo6nEgigDVJ4E",
      libraries: ['places', 'drawing', 'geometry']
    }),
  ],
  declarations: [
    ListShipmentMethodsComponent,
    ShipmentMethodComponent,
    SelectShipmentMethodComponent
  ],
  exports: [
    ShipmentMethodComponent,
    SelectShipmentMethodComponent
  ],
  entryComponents: [
    ShipmentMethodComponent,
    SelectShipmentMethodComponent
  ],
  providers: [
    ShipmentMethodService
  ]
})

export class ShipmentMethodModule { }

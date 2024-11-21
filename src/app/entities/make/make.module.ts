import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { MakeComponent } from './crud/make.component';
import { ListMakesComponent } from './list/list-makes.component';
import { MakeRoutingModule } from './make-routing.module'; // Asegúrate de importar las rutas del módulo
import { MakeService } from './make.service';

@NgModule({
  declarations: [MakeComponent, ListMakesComponent], // Declara los componentes que forman parte del módulo
  imports: [
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
    MakeRoutingModule, // Importa MakeRoutingModule para que las rutas sean reconocidas
  ],
  providers: [MakeService], // El servicio MakeService
})
export class MakeModule {}
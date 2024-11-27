import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { ExportCitiComponent } from './export-citi/export-citi.component';
import { ExportExcelComponent } from './export-excel/export-excel.component';
import { ExportIvaComponent } from './export-iva/export-iva.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbAlertModule,
    FocusDirective,
    PipesModule,
  ],
  declarations: [ExportExcelComponent, ExportCitiComponent, ExportIvaComponent],
  exports: [ExportExcelComponent, ExportCitiComponent, ExportIvaComponent],
  providers: [TranslatePipe],
})
export class ExportersModule {}

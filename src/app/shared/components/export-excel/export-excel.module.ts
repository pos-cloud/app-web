import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelComponent } from './export-excel.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ExportExcelComponent],
  exports: [ExportExcelComponent],
  providers: [TranslatePipe],
})
export class ExportExcelModule {}

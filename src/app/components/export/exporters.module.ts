import { NgModule } from '@angular/core';
import { ExportExcelComponent } from './export-excel/export-excel.component';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportCitiComponent } from './export-citi/export-citi.component';
import { ExportIvaComponent } from './export-iva/export-iva.component';
import { NgbModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'app/main/directives/directives.module';
import { PipesModule } from 'app/main/pipes/pipes.module';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbAlertModule,
    DirectivesModule,
    PipesModule
  ],
	declarations: [
    ExportExcelComponent,
    ExportCitiComponent,
    ExportIvaComponent,
	],
	exports: [
    ExportExcelComponent,
    ExportCitiComponent,
    ExportIvaComponent,
	],
	providers: [
		TranslatePipe
	]
})

export class ExportersModule { }

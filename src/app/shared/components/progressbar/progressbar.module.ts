import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ProgressbarComponent } from './progressbar.component';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [
		CommonModule,
    NgbProgressbarModule
	],
	declarations: [
		ProgressbarComponent
	],
	exports: [
		ProgressbarComponent
	],
	schemas: [
		NO_ERRORS_SCHEMA
	]
})

export class ProgressbarModule { }

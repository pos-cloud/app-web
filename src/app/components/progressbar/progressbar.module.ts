import { NgModule } from '@angular/core';
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
	]
})

export class ProgressbarModule { }

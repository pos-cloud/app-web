import { NgModule } from '@angular/core';
import { FocusDirective } from './focus.directive';
import { NgbdSortableHeader } from './sortable.directive';

@NgModule({
	declarations: [
		FocusDirective,
		NgbdSortableHeader
	],
	exports: [
		FocusDirective
	]
})

export class DirectivesModule { }

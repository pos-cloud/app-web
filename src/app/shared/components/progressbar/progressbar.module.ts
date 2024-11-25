import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { ProgressbarComponent } from './progressbar.component';

@NgModule({
  imports: [CommonModule, NgbProgressbarModule],
  declarations: [ProgressbarComponent],
  exports: [ProgressbarComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class ProgressbarModule {}

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddressComponent } from './crud/address.component';
import { AutocompleteComponent } from './google-places.component';

@NgModule({
  declarations: [AddressComponent, AutocompleteComponent],
  exports: [AddressComponent, AutocompleteComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
})
export class AddressModule {}

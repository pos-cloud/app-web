import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AddressComponent } from './crud/address.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './google-places.component';
import { AddressService } from './address.service';

@NgModule({
    declarations: [
        AddressComponent,
        AutocompleteComponent,
    ],
    exports: [
        AddressComponent,
        AutocompleteComponent,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: []
})

export class AddressModule { }

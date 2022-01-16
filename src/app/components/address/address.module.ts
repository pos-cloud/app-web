import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AddressComponent } from './crud/address.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './google-places.component';
import { AgmCoreModule } from '@agm/core';
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
        ReactiveFormsModule,
        AgmCoreModule.forRoot({
            apiKey: "AIzaSyCi1AySMkCMeuptt0rwsgpo6nEgigDVJ4E",
            libraries: ['places', 'geocoding']
        }),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: []
})

export class AddressModule { }

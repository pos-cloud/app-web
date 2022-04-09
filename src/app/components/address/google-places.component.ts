import { Component, ViewChild, EventEmitter, Output, AfterViewInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ShipmentMethod, ZoneType, Zone } from '../shipment-method/shipment-method.model';
import { Address } from './address.model';
declare const google: any;

@Component({
  selector: 'app-google-places',
  template: `
    <label for="address">Dirección y Número (*)<br></label>
    <input class="form-control inputAddress"
      type="text"
      (input)="this.error='';changeAddress()"
      (blur)="searchAddress()"
      (change)="searchAddress();"
      [(ngModel)]="autocompleteInput"
      #addresstext
      >
    <span *ngIf="error" style="color: red;">{{error}}</span>
    `,
  providers: [TranslateMePipe]
})
export class AutocompleteComponent implements AfterViewInit {

  @Input() adressType: string;
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild("addresstext") addresstext: any;
  @Input("shipmentMethod") shipmentMethod: ShipmentMethod;
  @Input() autocompleteInput: string;
  public loading: boolean = false;
  public autocomplete: any;
  public place: any;
  public error: string = '';

  constructor(
    private translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) { }

  async ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  public async searchAddress() {
    setTimeout(() => {
      if (this.place) {
        this.invokeEvent(this.place);
      } else {
        if ((this.autocompleteInput && this.autocompleteInput.split(',').length > 2)) {
          let geocoder = new google.maps.Geocoder();
          geocoder.geocode({ 'address': this.autocompleteInput }, (results, status) => {
            this.invokeEvent(results[0]);
          });
        } else {
          this.error = 'Debe ingresar una dirección y número, ciudad, pronvicia.';
        }
      }
    }, 1000);
  }

  public changeAddress() {
    this.setAddress.emit({ place: null, autocompleteInput: this.autocompleteInput });
    this.place = null;
  }

  private getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
      {
        componentRestrictions: { country: 'AR' },
        types: [this.adressType]
      });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.autocomplete = autocomplete;
      this.place = autocomplete.getPlace();
    });
  }

  public async invokeEvent(place: Object) {
    let isValid: boolean = true;

    if (isValid && !place) {
      isValid = false;
      this.error = 'Debe ingresar una dirección correcta';
    }
    if (isValid) {
      let address = new Address();
      address.latitude = place['geometry'].location.lat().toString();
      address.longitude = place['geometry'].location.lng().toString();

      for (let d of place['address_components']) {
        switch (d.types[0]) {
          case 'route':
            address.name = d.long_name;
            break;
          case 'street_number':
            address.number = d.long_name;
            break;
          case 'locality':
            address.city = d.long_name;
            break;
          case 'administrative_area_level_1':
            address.state = d.long_name;
            break;
          case 'country':
            address.country = d.long_name;
            break;
          case 'postal_code':
            address.postalCode = d.long_name;
            break;
        }
      }

      if (isValid && !address.name) {
        isValid = false;
      }

      if (isValid && !address.number) {
        // isValid = false;
      }

      if (isValid && !address.city) {
        address.city = address.state;
      }

      if (isValid && !address.state) {
        isValid = false;
      }

      if (isValid && !address.country) {
        isValid = false;
      }

      if (isValid && place && place[1]) {
        isValid = false;
      }

      if (isValid) {
        if (!address.name) {
          this.error = 'Debe ingresar una dirección correcta';
        } else if (!address.number && this.autocomplete && this.autocomplete['gm_accessors_'] && this.autocomplete['gm_accessors_']['place']['re']) {
          // this.error = 'Debe ingresar el número de la direccion';
        } else if (!address.number && this.autocomplete && this.autocomplete['gm_accessors_'] && this.autocomplete['gm_accessors_']['place']['Le']) {
          // this.error = 'Debe ingresar el número de la direccion';
        }
      }
    }

    if (isValid) {
      // RECORRER ZONAS QUE EXCLUYE
      let numberOfZonesIncluded: number = 0;
      if (isValid) {
        for (let zone of this.shipmentMethod.zones) {
          if ((!isValid || this.checkZone(place, zone)) && zone.type === ZoneType.OUT) isValid = false;
          if (zone.type === ZoneType.IN) numberOfZonesIncluded++;
        }
      }
      // RECORRER ZONAS QUE INGLUYE
      if (numberOfZonesIncluded > 0 && isValid) {
        isValid = false;
        if (!isValid) {
          for (let zone of this.shipmentMethod.zones) {
            if ((isValid || this.checkZone(place, zone)) && zone.type === ZoneType.IN) isValid = true;
          }
        }
      }
      if (isValid) {
        this.setAddress.emit({ place: place, autocompleteInput: this.autocompleteInput });
      } else {
        this.error = 'El domicilio indicado no se encuentra dentro del área de cobertura para envíos.';
        this.setAddress.emit({ place: null, autocompleteInput: null });
        this.place = null;
      }
    } else {
      this.setAddress.emit({ place: null, autocompleteInput: null });
      this.place = null;
    }
  }

  public checkZone(place, zone: Zone): boolean {
    let point = [];
    point['lat'] = place['geometry'].location.lat();
    point['lng'] = place['geometry'].location.lng();
    zone.points.push(zone.points[0]);
    let result = this.pointInPolygon(point, zone.points, true);
    if (result === 'vertex' || result === 'inside') {
      return true;
    } else {
      return false;
    }
  }

  pointInPolygon(point, vertices, pointOnVertex) {

    // Checar si el punto se encuentra exactamente en un vértice
    if (pointOnVertex == true && this.isPointOnVertex(point, vertices) == true) {
      return "vertex";
    }

    // Checar si el punto está adentro del poligono o en el borde
    let intersections = 0;

    if (vertices.length > 0) {
      for (let i = 1; i < vertices.length; i++) {
        let vertex1 = vertices[i - 1];
        let vertex2 = vertices[i];
        if (vertices[i] &&
          vertex1['lat'] &&
          vertex1['lng'] &&
          vertex2['lat'] &&
          vertex2['lng'] &&
          point['lat'] &&
          point['lng']) {
          if (vertex1['lng'] == vertex2['lng'] &&
            vertex1['lng'] == point['lng'] &&
            point['lat'] > Math.min(vertex1['lat'], vertex2['lat']) &&
            point['lat'] < Math.max(vertex1['lat'], vertex2['lat'])) { // Checar si el punto está en un segmento horizontal
            return "boundary";
          }
          if (point['lng'] > Math.min(vertex1['lng'], vertex2['lng']) && point['lng'] <= Math.max(vertex1['lng'], vertex2['lng']) && point['lat'] <= Math.max(vertex1['lat'], vertex2['lat']) && vertex1['lng'] != vertex2['lng']) {
            let xinters = (point['lng'] - vertex1['lng']) * (vertex2['lat'] - vertex1['lat']) / (vertex2['lng'] - vertex1['lng']) + vertex1['lat'];
            if (xinters == point['lat']) { // Checar si el punto está en un segmento (otro que horizontal)
              return "boundary";
            }
            if (vertex1['lat'] == vertex2['lat'] || point['lat'] <= xinters) {
              intersections++;
            }
          }
        }
      }
    }
    // Si el número de intersecciones es impar, el punto está dentro del poligono.
    if (intersections % 2 != 0) {
      return "inside";
    } else {
      return "outside";
    }
  }

  isPointOnVertex(point, vertices) {
    if (vertices.length > 0) {
      for (let i = 0; i < vertices.length; i++) {
        if (vertices[i] &&
          point['lat'] &&
          vertices[i]['lat'] &&
          point['lng'] &&
          vertices[i]['lng'] &&
          point['lat'] === vertices[i]['lat'] &&
          point['lng'] === vertices[i]['lng']) {
          return true;
        }
      }
    }
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}

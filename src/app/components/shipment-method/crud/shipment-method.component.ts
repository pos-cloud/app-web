import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { FormField } from 'app/util/formField.interface';
import { ShipmentMethod, ZoneType } from '../shipment-method.model';
import { ShipmentMethodService } from '../shipment-method.service';
import { Application } from 'app/components/application/application.model';
import { ApplicationService } from 'app/components/application/application.service';
import Resulteable from 'app/util/Resulteable';
declare const google: any;

@Component({
    selector: 'app-shipment-method',
    templateUrl: './shipment-method.component.html',
    styleUrls: ['./shipment-method.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe]
})

export class ShipmentMethodComponent implements OnInit {

    @Input() objId: string;
    @Input() readonly: boolean;
    @Input() operation: string;
    public obj: ShipmentMethod;
    public objForm: FormGroup;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public title: string = 'shipment-method';
    private subscription: Subscription = new Subscription();
    private capitalizePipe: CapitalizePipe = new CapitalizePipe();
    public focus$: Subject<string>[] = new Array();
    public stateId: number;
    public filesToUpload: Array<File>;
    public selectedFile: File = null;
    public filename: string;
    public src: any;
    public imageURL: string;
    public applications: Application[];

    public formFields: FormField[] = [{
        name: 'name',
        tag: 'input',
        tagType: 'text',
        validators: [Validators.required],
        focus: true,
        class: 'form-group col-md-12'
    }, {
        name: 'requireAddress',
        tag: 'select',
        tagType: 'boolean',
        values: ['true', 'false'],
        class: 'form-group col-md-12'
    }, {
        name: 'requireTable',
        tag: 'select',
        tagType: 'boolean',
        values: ['true', 'false'],
        class: 'form-group col-md-12'
    }];
    public formErrors: {} = {};
    public validationMessages = {
        'required': 'Este campo es requerido.',
    };

    constructor(
        private _objService: ShipmentMethodService,
        private _toastr: ToastrService,
        private _title: Title,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public translatePipe: TranslateMePipe,
        private _applicationService: ApplicationService
    ) {
        this.obj = new ShipmentMethod();
        for (let field of this.formFields) {
            this.formErrors[field.name] = '';
            if (field.tag === 'autocomplete') {
                this.focus$[field.name] = new Subject<string>();
            }
        }
    }

    public async ngOnInit() {
        this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
        this.title = this.capitalizePipe.transform(this.title);
        this._title.setTitle(this.title);
        this.buildForm();
        if (this.objId && this.objId !== '') {
            this.subscription.add(await this._objService.getAll({
                project: {
                    name: 1,
                    'applications._id': 1,
                    'applications.name': 1,
                    requireAddress: 1,
                    zones: 1,
                },
                match: { _id: { $oid: this.objId } }
            }).subscribe(
                result => {
                    this.loading = false;
                    if (result.status === 200) {
                        this.obj = result.result[0];
                        this.setValuesForm();
                    }
                    else this.showToast(result);
                },
                error => this.showToast(error)
            ));
        } else {
            if (this.operation !== 'add') this.showToast(null, 'danger', 'Debe ingresar un identificador válido')
        }
        await this.getAllApplications({})
            .then((result: Application[]) => {
                this.applications = result;
                this.setValuesForm();
            })
            .catch((error: Resulteable) => this.showToast(error));
    }

    public ngAfterViewInit(): void {
        this.focusEvent.emit(true);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public buildForm(): void {

        let fields: {} = {
            _id: [this.obj._id],
            applications: this._fb.array([])
        };
        for (let field of this.formFields) {
            fields[field.name] = [this.obj[field.name], field.validators]
        }
        this.objForm = this._fb.group(fields);

        this.objForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.focusEvent.emit(true);
    }

    public onValueChanged(fieldID?: any): void {
        if (!this.objForm) { return; }
        const form = this.objForm;
        for (const field in this.formErrors) {
            if (!fieldID || field === fieldID) {
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && !control.valid) {
                    const messages = this.validationMessages;
                    for (const key in control.errors) {
                        this.formErrors[field] += messages[key] + ' ';
                    }
                }
            }
        }
    }

    public validateAutocomplete(c: FormControl) {
        let result = (c.value && Object.keys(c.value)[0] === '0') ? {
            validateAutocomplete: {
                valid: false
            }
        } : null;
        return result;
    }

    public setValuesForm(): void {
        let values: {} = {
            _id: this.obj._id
        }
        for (let field of this.formFields) {
            switch (field.tagType) {
                case 'date':
                    values[field.name] = (this.obj[field.name] !== undefined) ? moment(this.obj[field.name]).format('YYYY-MM-DD') : null
                    break;
                default:
                    values[field.name] = (this.obj[field.name] !== undefined) ? this.obj[field.name] : null
                    break;
            }
        }
        if (this.applications && this.applications.length > 0) {
            this.applications.forEach(x => {
                let exists: boolean = false;
                if (this.obj && this.obj.applications && this.obj.applications.length > 0) {
                    this.obj.applications.forEach(y => {
                        if (x._id === y._id) {
                            exists = true;
                            const control = new FormControl(y);
                            (this.objForm.controls.applications as FormArray).push(control);
                        }
                    })
                }
                if (!exists) {
                    const control = new FormControl(false);
                    (this.objForm.controls.applications as FormArray).push(control);
                }
            })
        }
        this.objForm.patchValue(values);
    }

    public getAllApplications(match: {}): Promise<Application[]> {
        return new Promise<Application[]>((resolve, reject) => {
            this.subscription.add(this._applicationService.getAll({
                match,
                sort: { name: 1 },
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public async addObj() {

        let isValid: boolean = true;

        isValid = (this.operation === 'delete') ? true : this.objForm.valid;

        if (isValid) {
            this.obj = Object.assign(this.obj, this.objForm.value);
            const selectedOrderIds = this.objForm.value.applications
                .map((v, i) => (v ? this.applications[i] : null))
                .filter(v => v !== null);
            this.obj.applications = selectedOrderIds;
        } else {
            this.onValueChanged();
        }

        if (isValid) {
            for (let field of this.formFields) {
                switch (field.tagType) {
                    case 'date':
                        this.obj[field.name] = moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
                        break;
                    case 'number':
                        this.obj[field.name] = parseFloat(this.obj[field.name]);
                        break;
                    case 'boolean':
                        this.obj[field.name] = this.obj[field.name] == 'true' || this.obj[field.name] == true;
                        break;
                    case 'text':
                        if (field.tag === 'autocomplete' && (this.obj[field.name] == "" || (this.obj[field.name] && !this.obj[field.name]['_id']))) {
                            this.obj[field.name] = null;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        if (isValid) {
            switch (this.operation) {
                case 'add':
                    this.saveObj();
                    break;
                case 'update':
                    this.updateObj();
                    break;
                case 'delete':
                    this.deleteObj();
                    break;
            }
        }
    }

    public saveObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.save(this.obj).subscribe(
                result => {
                    this.showToast(result);
                    if (result.status === 200) this.activeModal.close({ obj: this.obj });
                },
                error => this.showToast(error)
            )
        );
    }

    public updateObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.update(this.obj).subscribe(
                result => {
                    this.showToast(result);
                    if (result.status === 200) this.activeModal.close({ obj: this.obj });
                },
                error => this.showToast(error)
            )
        );
    }

    public deleteObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.delete(this.obj._id).subscribe(
                async result => {
                    this.showToast(result);
                    if (result.status === 200) this.activeModal.close({ obj: this.obj });
                },
                error => this.showToast(error)
            )
        );
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

    // PERSONALIZADO GOOGLE MAPS
    map: any;
    lat: number = -31.4276889;
    lng: number = -62.0941095;
    pointList: { lat: number; lng: number }[] = [];
    drawingManager: any;
    selectedShape: any;
    selectedArea = 0;
    zones: any[] = new Array();
    zoneName: string;
    zoneType: ZoneType = ZoneType.OUT;
    zonesActive: {
        zone: any,
        polyline: any
    }[];

    onMapReady(map) {
        this.map = map;
        this.setCurrentPosition();
        this.initDrawingManager(map);
    }

    changeZoneType() {
        if (this.zoneType === ZoneType.IN) {
            this.drawingManager.polygonOptions.fillColor = 'green';
            this.drawingManager.polygonOptions.strokeColor = 'green';
        } else {
            this.drawingManager.polygonOptions.fillColor = 'red';
            this.drawingManager.polygonOptions.strokeColor = 'red';
        }
    }

    initDrawingManager = (map: any) => {
        const self = this;
        const options = {
            drawingControl: true,
            drawingControlOptions: {
                drawingModes: ['polygon']
            },
            polygonOptions: {
                draggable: false,
                editable: true,
                fillColor: 'red',
                strokeColor: 'red'
            },
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
        };
        this.drawingManager = new google.maps.drawing.DrawingManager(options);
        this.drawingManager.setMap(map);
        google.maps.event.addListener(
            this.drawingManager,
            'overlaycomplete',
            (event) => {
                if (event.type === google.maps.drawing.OverlayType.POLYGON) {
                    const paths = event.overlay.getPaths();
                    for (let p = 0; p < paths.getLength(); p++) {
                        google.maps.event.addListener(
                            paths.getAt(p),
                            'set_at',
                            () => {
                                if (!event.overlay.drag) {
                                    self.updatePointList(event.overlay.getPath());
                                }
                            }
                        );
                        google.maps.event.addListener(
                            paths.getAt(p),
                            'insert_at',
                            () => {
                                self.updatePointList(event.overlay.getPath());
                            }
                        );
                        google.maps.event.addListener(
                            paths.getAt(p),
                            'remove_at',
                            () => {
                                self.updatePointList(event.overlay.getPath());
                            }
                        );
                    }
                    self.updatePointList(event.overlay.getPath());
                }
                if (event.type !== google.maps.drawing.OverlayType.MARKER) {
                    // Switch back to non-drawing mode after drawing a shape.
                    self.drawingManager.setDrawingMode(null);
                    // To hide:
                    self.drawingManager.setOptions({
                        drawingControl: false,
                    });

                    // set selected shape object
                    const newShape = event.overlay;
                    newShape.type = event.type;
                    this.setSelection(newShape);
                }
            }
        );
    }
    private setCurrentPosition() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.map.setCenter(new google.maps.LatLng(this.lat, this.lng));
            });
        }
    }

    setSelection(shape) {
        this.selectedShape = shape;
        shape.setEditable(true);
    }

    deleteSelectedShape() {
        if (this.selectedShape) {
            this.selectedShape.setMap(null);
            this.selectedArea = 0;
            this.pointList = [];
            // To show:
            this.drawingManager.setOptions({
                drawingControl: true,
            });
        }
    }

    updatePointList(path) {
        this.pointList = [];
        const len = path.getLength();
        for (let i = 0; i < len; i++) {
            this.pointList.push(
                path.getAt(i).toJSON()
            );
        }
        this.selectedArea = google.maps.geometry.spherical.computeArea(
            path
        );
    }

    public addZone() {
        let isValid: boolean = true;
        if (isValid && (!this.zoneName || this.zoneName === '')) {
            isValid = false;
            this.showToast(null, 'info', 'Debe completar el nombre de la zona.');
        }
        if (isValid && this.existsZoneName()) {
            isValid = false;
            this.showToast(null, 'info', 'El nombre de la zona ya existe.');
        }
        if (isValid && (!this.zoneType || this.zoneType.toString() === '')) {
            isValid = false;
            this.showToast(null, 'info', 'Debe completar el tipo la zona.');
        }
        if (isValid && (!this.pointList || this.pointList.length === 0)) {
            isValid = false;
            this.showToast(null, 'info', 'Debe dibujar la zona en el mapa debajo.');
        }
        if (isValid) {
            if (!this.obj.zones) this.obj.zones = new Array();
            this.obj.zones.push({
                name: this.zoneName,
                type: this.zoneType,
                points: this.pointList,
                area: this.selectedArea
            });
            this.zoneName = '';
            this.deleteSelectedShape();
            this.showToast(null, 'success', 'Operación realizada con éxito');
            this.initDrawingManager(this.map);
        }
    }

    public existsZoneName() {
        let exists: boolean = false;
        if (this.obj.zones && this.obj.zones.length > 0) {
            for (let zone of this.obj.zones) {
                if (zone.name === this.zoneName) exists = true;
            }
        }
        return exists;
    }
    public createZone() {
        this.zoneName = '';
        this.selectedArea = 0;
        this.pointList = [];
        for (let zone of this.zonesActive) {
            zone.polyline.setMap(null);
        }
        this.zonesActive = null;
        this.initDrawingManager(this.map);
    }

    public viewAllZones() {
        this.selectedArea = 0;

        for (let zone of this.obj.zones) {
            this.selectedArea += zone.area;
            zone.points.push(zone.points[0]);
            let fillColor: string;
            let strokeColor: string;
            if (zone.type === ZoneType.IN) {
                fillColor = 'green';
                strokeColor = 'green';
            } else {
                fillColor = 'red';
                strokeColor = 'red';
            }

            if (!this.zonesActive) this.zonesActive = new Array();
            this.zonesActive.push({
                zone: zone,
                polyline: new google.maps.Polyline({
                    path: zone.points,
                    geodesic: true,
                    fillColor: fillColor,
                    strokeColor: strokeColor,
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    editable: false,
                    map: this.map
                })
            });
        }
        this.drawingManager.setMap(null);
    }

    public viewZone(pos: number) {
        this.pointList = this.obj.zones[pos].points;
        this.selectedArea = this.obj.zones[pos].area;
        this.zoneName = this.obj.zones[pos].name;
        this.zoneType = this.obj.zones[pos].type;

        this.obj.zones[pos].points.push(this.obj.zones[pos].points[0]);

        let fillColor: string;
        let strokeColor: string;
        if (this.zoneType === ZoneType.IN) {
            fillColor = 'green';
            strokeColor = 'green';
        } else {
            fillColor = 'red';
            strokeColor = 'red';
        }

        if (!this.zonesActive) this.zonesActive = new Array();
        this.zonesActive.push({
            zone: this.obj.zones[pos],
            polyline: new google.maps.Polyline({
                path: this.pointList,
                geodesic: true,
                fillColor: fillColor,
                strokeColor: strokeColor,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                editable: false,
                map: this.map
            })
        });
        this.drawingManager.setMap(null);
    }

    public deleteZone(pos: number) {
        this.obj.zones.splice(pos, 1);
        this.showToast(null, 'success', 'Operación realizada con éxito');
    }
}

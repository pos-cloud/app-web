import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Structure, Utilization } from 'app/components/structure/structure';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { StructureService } from 'app/components/structure/structure.service';
import { Router } from '@angular/router';
import { Config } from 'app/app.config';
import { ArticleService } from 'app/components/article/article.service';
import { Article } from 'app/components/article/article';

import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
    selector: 'app-structure',
    templateUrl: './structure.component.html',
    styleUrls: ['./structure.component.css']
})

export class StructureComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() structureId: string;
    
    utilizations: Utilization[] = [Utilization.Sale, Utilization.Production];
    filterKey = '';
    filteredItems = [];
    articles: Article[];
    structures: Structure[];
    alertMessage: string = '';
    userType: string;
    structure: Structure;
    areStructureEmpty: boolean = true;
    orderTerm: string[] = ['parent'];
    propertyTerm: string;
    areFiltersVisible: boolean = false;
    loading: boolean = false;
    focusEvent = new EventEmitter<boolean>();
    userCountry: string;
    orientation: string = 'horizontal';
    result;
    structureForm: UntypedFormGroup;
    searching: boolean = false;
    checkboxModel;

    formErrors = {
        'parent': '',
        'child': '',
        'quantity': '',
        'increasePrice' : ''
    };
    validationMessages = {
        'parent': {
            'required': 'Este campo es requerido.'
        },
        'child': {
            'required': 'Este campo es requerido.'
        },
        'quantity': {
            'required': 'Este campo es requerido.'
        }
    };

    searchArticles = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(term =>
                this.getArticles(`where="description": { "$regex": "${term}", "$options": "i" }&limit=20`).then(
                    articles => {
                        return articles;
                    }
                )
            ),
            tap(() => this.loading = false)
        )

    formatterArticles = (x: { description: string }) => x.description;

    constructor(
        public alertConfig: NgbAlertConfig,
        public _structureService: StructureService,
        public _articleService: ArticleService,
        public _router: Router,
        public _fb: UntypedFormBuilder,
        public activeModal: NgbActiveModal,

    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.structure = new Structure();
    }

    ngOnInit() {
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.structureId) {
            this.getStructure();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getStructure() {

        this.loading = true;

        this._structureService.getStructure(this.structureId).subscribe(
            result => {
                if (!result.structure) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.structure = result.structure;
                    this.setValueForm();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public setValueForm(): void {

        if (!this.structure._id) { this.structure._id = ''; }
        if (!this.structure.quantity) { this.structure.quantity = 0; }
        if (!this.structure.utilization) { this.structure.utilization = Utilization.Sale; }
        if (!this.structure.increasePrice) { this.structure.increasePrice = 0 }
        if (!this.structure.optional) { this.structure.optional = false }



        const values = {
            '_id': this.structure._id,
            'parent': this.structure.parent,
            'child': this.structure.child,
            'quantity': this.structure.quantity,
            'utilization': this.structure.utilization,
            'optional': this.structure.optional,
            'increasePrice': this.structure.increasePrice

        };

        this.structureForm.setValue(values);
    }

    public buildForm(): void {

        this.structureForm = this._fb.group({
            '_id': [this.structure._id, []],
            'parent': [this.structure.parent, [
                Validators.required
            ]
            ],
            'child': [this.structure.child, [
                Validators.required
            ]
            ],
            'quantity': [this.structure.quantity, [
                Validators.required
            ]
            ],
            'utilization': [this.structure.utilization, [
                Validators.required
            ]
            ],
            'optional': [this.structure.optional, [
            ]
            ],
            'increasePrice': [this.structure.increasePrice, [
            ]
            ]
        });

        this.structureForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.structureForm) { return; }
        const form = this.structureForm;

        for (const field in this.formErrors) {
            this.formErrors[field] = '';
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    public addStructure() {

        this.structure = this.structureForm.value;

        if (!this.structure.optional) {
            this.structure.increasePrice = null;
            this.structure.optional = false
        }


        switch (this.operation) {
            case 'add':
                this.saveStructure();
                break;
            case 'edit':
                this.updateStructure();
                break;
            case 'delete':
                this.deleteStructure();
            default:
                break;
        }
    }

    public updateStructure() {

        this.loading = true;

        if (this.isValid()) {
            this._structureService.updateStructure(this.structure).subscribe(
                async result => {
                    if (!result.structure) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        if (await this.updateArticle()) {
                            this.loading = false;
                            this.showMessage('La estructura se ha actualizado con éxito.', 'success', false);
                        } else {
                            this.showMessage('No se pudo actualizar el producto padre.', 'danger', false);

                        }
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    public saveStructure() {

        this.loading = true;

        if (this.isValid()) {
            this._structureService.saveStructure(this.structure).subscribe(
                async result => {
                    if (!result.structure) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.loading = false;
                        if (await this.updateArticle()) {
                            this.showMessage('La estructura se ha añadido con éxito.', 'success', false);
                            this.structure = new Structure();
                            this.structure.parent = this.structureForm.value.parent;
                            this.buildForm();
                            this.focusEvent.emit(true);
                        } else {
                            this.showMessage('No se pudo actualizar el producto padre.', 'danger', false);
                        }
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    public deleteStructure() {

        this.loading = true;

        this._structureService.deleteStructure(this.structure._id).subscribe(
            async result => {
                this.loading = false;
                if (!result.structure) {
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    if (await this.updateArticle()) {
                        this.activeModal.close();
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updateArticle() {

        return new Promise((resolve, reject) => {
            if (this.operation === "delete") {
                this.structure.parent.containsStructure = false;
            } else {
                this.structure.parent.containsStructure = true;
            }
            this._articleService.updateArticle(this.structure.parent, null).subscribe(
                result => {
                    if (result && result.article) {
                        resolve(true)
                    }
                },
                error => {
                    resolve(false)
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            )
        })
    }

    public isValid(): boolean {

        let valid = true;

        if (this.structure.child._id === this.structure.parent._id) {
            this.showMessage("Un producto no puede ser estructura de si mismo.", "info", true);
            valid = false;
        }

        if (this.structure.quantity === 0 || this.structure.quantity < 0 || this.structure.quantity === null) {
            this.showMessage("La cantidad tiene que ser mayor a 0.", "info", true);
            valid = false;
        }

        if (this.structure.optional && this.structure.increasePrice === null) {
            this.showMessage("El incremento de precio no puede ser vacio", "info", true);
            valid = false;
        }

        return valid;
    }

    private getArticles(query): Promise<Article[]> {

        return new Promise((resolve, reject) => {

            this._articleService.getArticles(query).subscribe(
                result => {
                    if (!result.articles) {
                        resolve(null);
                    } else {
                        resolve(result.articles);
                    }
                },
                error => {
                    resolve(null);
                }
            );
        });
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }

}
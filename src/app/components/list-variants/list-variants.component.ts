import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Variant } from './../../models/variant';
import { Article } from './../../models/article';

import { VariantService } from './../../services/variant.service';

import { AddVariantComponent } from './../../components/add-variant/add-variant.component';
import { DeleteVariantComponent } from './../../components/delete-variant/delete-variant.component';
import { ImportComponent } from './../../components/import/import.component';

@Component({
  selector: 'app-list-variants',
  templateUrl: './list-variants.component.html',
  styleUrls: ['./list-variants.component.css'],
  providers: [NgbAlertConfig]
})

export class ListVariantsComponent implements OnInit {

  @Input() variantsLocals: Variant[];
  public variants: Variant[];
  @Input() article: Article;
  public areVariantsEmpty: boolean;
  public alertMessage: string;
  public user: string;
  public loading: boolean = false;
  @Output() eventReturnVariants: EventEmitter<Variant[]>;

  constructor(
    public _variantService: VariantService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.variants = new Array();
    this.eventReturnVariants = new EventEmitter<Variant[]>();
    this.alertMessage = "";
    this.areVariantsEmpty = true;

    if(!this.variantsLocals || (this.variantsLocals && this.variantsLocals.length > 0)) {
      this.variantsLocals = new Array();
    }

    if(!this.article) {
      this.article = new Article();
    }
   }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.user = pathLocation[1];
    
    if(this.article && this.article._id && this.article._id !== "") {
      this.getVariantsByArticleParent();
    }
  }

  ngOnDestroy() {
    this.eventReturnVariants.emit(this.variantsLocals);
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    this._variantService.getVariantsByArticleParent(this.article).subscribe(
      result => {
        if (!result.variants) {
          if (this.variantsLocals && this.variantsLocals.length > 0) {
            this.areVariantsEmpty = false;
          } else {
            this.areVariantsEmpty = true;
          }
          this.variants = null;
        } else {
          this.variants = result.variants;
          this.areVariantsEmpty = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    
    if (this.article && this.article._id && this.article._id !== "") {
      this.getVariantsByArticleParent();
    } else {
      if (this.variantsLocals && this.variantsLocals.length > 0) {
        this.areVariantsEmpty = false;
      } else {
        this.areVariantsEmpty = true;
      }
    }

    this.eventReturnVariants.emit(this.variantsLocals);
  }

  public openModal(op: string, variant: Variant): void {

    let modalRef;
    switch (op) {
      case 'delete':
        modalRef = this._modalService.open(DeleteVariantComponent, { size: 'lg' })
        modalRef.componentInstance.variant = variant;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            if (this.article && this.article._id && this.article._id !== "") {
              this.getVariantsByArticleParent();
            }
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addVariant(variant: Variant): void {
    
    if(!this.variantExists(variant)) {
      this.variantsLocals.push(variant);
    }
    
    this.refresh();
  }

  public variantExists(variant: Variant): boolean {

    var exists: boolean = false;

    if(this.variantsLocals && this.variantsLocals.length > 0) {
      for(var variantAux of this.variantsLocals) {
        if( variantAux.type._id === variant.type._id &&
            variantAux.value._id === variant.value._id) {
              exists = true;
              this.showMessage("La variante " + variant.type.name + " " + variant.value.description + " ya existe", "info", true);
        }
      }
    }

    if(!exists) {
      if (this.variants && this.variants.length > 0) {
        for (var variantAux of this.variants) {
          if (variantAux.type._id === variant.type._id &&
            variantAux.value._id === variant.value._id) {
            exists = true;
            this.showMessage("La variante " + variant.type.name + " " + variant.value.description + " ya existe", "info", true);
          }
        }
      }
    }

    return exists;
  }

  public deleteVariantLocal(variant: Variant): void {

    let i: number = 0;
    let variantToDelete: number = -1;

    if (this.variantsLocals && this.variantsLocals.length > 0) {
      for (var variantAux of this.variantsLocals) {
        if (variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id) {
          variantToDelete = i;
        }
        i++;
      }
    }

    if (variantToDelete !== -1) {
      this.variantsLocals.splice(variantToDelete, 1);
    }

    this.refresh();
  }

  public deleteVariantDB(variant: Variant): void {
    this.openModal("delete",variant);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}

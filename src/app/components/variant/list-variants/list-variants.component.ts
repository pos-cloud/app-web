import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from '../../article/article';
import { Variant } from '../variant';

import { VariantService } from '../../../core/services/variant.service';

import { DeleteVariantComponent } from '../delete-variant/delete-variant.component';

@Component({
  selector: 'app-list-variants',
  templateUrl: './list-variants.component.html',
  styleUrls: ['./list-variants.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
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
    this.alertMessage = '';
    this.areVariantsEmpty = true;

    if (
      !this.variantsLocals ||
      (this.variantsLocals && this.variantsLocals.length > 0)
    ) {
      this.variantsLocals = new Array();
    }

    if (!this.article) {
      this.article = new Article();
    }
  }

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.user = pathLocation[1];

    if (this.article && this.article._id && this.article._id !== '') {
      this.getVariantsByArticleParent();
    }
  }

  ngOnDestroy() {
    this.eventReturnVariants.emit(this.variantsLocals);
  }

  public getVariantsByArticleParent(): void {
    this.loading = true;

    let query = 'where="articleParent":"' + this.article._id + '"';

    this._variantService.getVariants(query).subscribe(
      (result) => {
        if (!result.variants) {
          if (this.variantsLocals && this.variantsLocals.length > 0) {
            this.areVariantsEmpty = false;
          } else {
            this.areVariantsEmpty = true;
          }
          this.variants = new Array();
        } else {
          this.variants = this.getUniqueVariants(result.variants);
          this.areVariantsEmpty = false;
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getUniqueVariants(variants: Variant[]): Variant[] {
    let variantsToReturn: Variant[] = new Array();

    for (let variant of variants) {
      if (variantsToReturn && variantsToReturn.length > 0) {
        let exists: boolean = false;
        for (let variantAux of variantsToReturn) {
          if (variantAux.value._id === variant.value._id) {
            exists = true;
          }
        }
        if (!exists) {
          variantsToReturn.push(variant);
        }
      } else {
        variantsToReturn.push(variant);
      }
    }

    return variantsToReturn;
  }

  public refresh(): void {
    if (this.article && this.article._id && this.article._id !== '') {
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
        modalRef = this._modalService.open(DeleteVariantComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.variant = variant;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              if (this.article && this.article._id && this.article._id !== '') {
                this.getVariantsByArticleParent();
              }
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addVariant(variant: Variant): void {
    if (!this.variantExists(variant)) {
      this.variantsLocals.push(variant);
    }

    this.refresh();
  }

  public variantExists(variant: Variant): boolean {
    let exists: boolean = false;

    if (this.variantsLocals && this.variantsLocals.length > 0) {
      for (let variantAux of this.variantsLocals) {
        if (
          variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id
        ) {
          exists = true;
          this.showMessage(
            'La variante ' +
              variant.type.name +
              ' ' +
              variant.value.description +
              ' ya existe',
            'info',
            true
          );
        }
      }
    }

    if (!exists) {
      if (this.variants && this.variants.length > 0) {
        for (let variantAux of this.variants) {
          if (
            variantAux.type._id === variant.type._id &&
            variantAux.value._id === variant.value._id
          ) {
            exists = true;
            this.showMessage(
              'La variante ' +
                variant.type.name +
                ' ' +
                variant.value.description +
                ' ya existe',
              'info',
              true
            );
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
      for (let variantAux of this.variantsLocals) {
        if (
          variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id
        ) {
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
    this.openModal('delete', variant);
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}

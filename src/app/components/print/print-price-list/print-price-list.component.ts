import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';


import * as jsPDF from 'jspdf';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../pipes/round-number.pipe';

//model
import { Make } from "../../../models/make";
import { Category } from "../../../models/category";

//service
import { ArticleService } from "../../../services/article.service";
import { MakeService } from '../../../services/make.service';
import { CategoryService } from '../../../services/category.service';
import { Article } from 'app/models/article';
import { ConfigService } from 'app/services/config.service';
import { VariantService } from 'app/services/variant.service';
import { ArticleFieldService } from 'app/services/article-field.service';
import { ArticleField } from 'app/models/article-field';

@Component({
  selector: 'app-print-price-list',
  templateUrl: './print-price-list.component.html',
  styleUrls: ['./print-price-list.component.css']
})
export class PrintPriceListComponent implements OnInit {

  public printPriceListForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public makes: Make;
  public categories: Category;
  public optionUpdate: string = "make";
  public dateFormat = new DateFormatPipe();
  public doc;
  public pdfURL;
  public articles : Article [];
  public config;
  public roundNumber = new RoundNumberPipe();
  public pageWidth;
  public pageHigh;
  public withImage = false;
  public articleFields : ArticleField [];
  public articleFieldsValues : []
  public imageURL
  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);


  public formErrors = {
    'make': '',
    'category': '',
  };

  public validationMessages = {
  };

  constructor(
    public _articleService: ArticleService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _makeService: MakeService,
    public _categoryService: CategoryService,  
    public _articleFields : ArticleFieldService,  
    public _configService: ConfigService,
    public _variantService: VariantService,
    private domSanitizer: DomSanitizer

  ) { 
    this.pageWidth = 210 * 100 / 35.27751646284102;
    this.pageHigh = 297 * 100 / 35.27751646284102;
    this.getMakes();
    this.getCategories();
    this.getArticleFields();
  }

  async ngOnInit() {

    await this._configService.getConfigApi().subscribe(
       result => {
        if(result && result.configs){
          this.config = result.configs
        }
       },
       error => {

       }
     )

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);

  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getMakes(): void {

    this.loading = true;

    this._makeService.getMakes('sort="description":1').subscribe(
      result => {
        if (!result.makes) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.makes = result.makes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCategories(): void {

    this.loading = true;

    this._categoryService.getCategories('sort="description":1').subscribe(
      result => {
        if (!result.categories) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.categories = result.categories;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getArticleFields() : void {
    
    this.loading = true;

    this._articleFields.getArticleFields().subscribe(
      result => {
        if (!result.articleFields) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.articleFields = result.articleFields;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getarticleFieldValue(articleField) : void {
    
    this.loading = true;
    
    let query = `where="_id":"${articleField}"`;

    this._articleFields.getArticleFields(query).subscribe(
      result => {
        if (!result.articleFields) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.articleFieldsValues = result.articleFields[0].value.split(';');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.printPriceListForm = this._fb.group({
      'make': [, []],
      'category': [, []],
      'withImage' : [,[]],
      'articleField' : [,[]],
      'articleFieldsValue' : [,[]]
    });

    this.printPriceListForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.printPriceListForm) { return; }
    const form = this.printPriceListForm;

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

  public getArticles(): void {

    this.loading = true;

    let match = `{`;

    if(this.printPriceListForm.value.make !== null){
      match += `"make._id" :  { "$oid" : "${this.printPriceListForm.value.make}" },`
    }

    if(this.printPriceListForm.value.category !== null){
      match += `"category._id" :  { "$oid" : "${this.printPriceListForm.value.category}" },`
    }

    if(this.printPriceListForm.value.otherFields !== null && this.printPriceListForm.value.articleFieldsValue !== null){
      match += `"otherFields.value" : "${this.printPriceListForm.value.articleFieldsValue}",`
    }
    
    match += `"type" : "Final", "operationType" : { "$ne" : "D" } }`;

    match = JSON.parse(match);


    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "_id": 1,
      type:1,
      code:1,
      description:1,
      salePrice:1,
      "category._id" : 1,
      "category.description": 1,
      "make._id": 1,
      "make.description": 1,
      "picture": 1,
      operationType: 1,
      "otherFields": 1,
      "containsVariants" : 1
    }

    let group = {
      _id: null,
      count: { $sum: 1 },
      articles: { $push: "$$ROOT" }
    };
    
    this._articleService.getArticlesV2(
        project, // PROJECT
        match, // MATCH
        { description: 1 }, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].articles && result[0].articles.length > 0) {
            this.articles = result[0].articles;
            this.printPriceList();
        } else {
            this.showMessage("No se encontraron articulos", 'danger', false);
            this.articles = null;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  async printPriceList() {
    
    var row = 15;
    var margin = 5;
    this.doc.setFontType('bold');

    this.doc.setFontSize(12);
    if (this.config[0].companyFantasyName) {
      this.doc.text(this.config[0].companyFantasyName, 5, row);
    }

    this.doc.setFontType('normal');
    row += 5;
    if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
      this.doc.text(this.config[0].companyIdentificationType.name + ":", margin, row);
      this.doc.text(this.config[0].companyIdentificationValue, 25, row);
    }

    this.doc.setFontType('bold');
    this.centerText(margin, margin, 210, 0, row, "LISTA DE PRECIOS AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY'));

    row += 3;
    this.doc.line(0, row, 400, row);
    


    if(this.printPriceListForm.value.withImage == false){
      row += 5;
      // Encabezado de la tabla de Detalle de Productos
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.normal);
      this.doc.text("Código", 5, row);
      this.doc.text("Descripción", 30, row);
      this.doc.text("Marca", 100, row);
      this.doc.text("Rubro", 145, row);
      this.doc.text("Precio", 190, row);
      this.doc.setFontType('normal');

      row += 3;
      this.doc.line(0, row, 400, row);
      row += 5;

      let page = 1;

      // // Detalle de productos
      if(this.articles && this.articles.length > 0) {
        for(let article of this.articles) {

          if(article.code) {
            this.doc.text(article.code, 5, row);
          }
          if (article.description) {
            this.doc.text(article.description.slice(0, 30), 30, row);
          }
          if (article.make && article.make.description) {
            this.doc.text(article.make.description.slice(0, 18), 100, row);
          }
          if (article.category && article.category.description) {
            this.doc.text(article.category.description.slice(0, 18), 145, row);
          }
          if (article.salePrice) {
            this.doc.text("$" + this.roundNumber.transform(article.salePrice).toString(), 190, row);
          }
          row += 5;

          if (row >= (this.pageHigh - 20)) {

            if(page === 120) {
              break;
            }
            this.doc.addPage();

            var row = 15;
            var margin = 5;
            this.doc.setFontType('bold');

            this.doc.setFontSize(12);
            if (this.config[0].companyFantasyName) {
              this.doc.text(this.config[0].companyFantasyName, 5, row);
            }

            this.doc.setFontType('normal');
            row += 5;
            if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
              this.doc.text(this.config[0].companyIdentificationType.name + ":", margin, row);
              this.doc.text(this.config[0].companyIdentificationValue, 25, row);
            }

            this.doc.setFontType('bold');
            this.centerText(margin, margin, 210, 0, row, "LISTA DE PRECIOS AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY'));

            row += 3;
            this.doc.line(0, row, 400, row);
            row += 5;

            // Encabezado de la tabla de Detalle de Productos
            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.normal);
            this.doc.text("Código", 5 , row);
            this.doc.text("Descripción", 30, row);
            this.doc.text("Marca", 100, row);
            this.doc.text("Rubro", 140, row);
            this.doc.text("Precio", 190, row);
            this.doc.setFontType('normal');

            row += 3;
            this.doc.line(0, row, 400, row);
            row += 5;
          }
        }
      }

      this.finishImpression();
    } else {
      let count = 0;
      let img;
      row +=5;
      if(this.articles && this.articles.length > 0){
        for(let article of this.articles) {
            count ++
            this.doc.setFontType('blod')
            if(article.picture !== 'default.jpg' &&  await this.getPicture(article.picture)){
              this.doc.addImage(this.imageURL, 'JPEG', 15, row, 60, 40);
            }
            row +=5
            this.doc.setFontSize(this.fontSizes.extraLarge)
            this.doc.text(95, row, article.description)
            row +=5
            this.doc.setFontSize(this.fontSizes.normal)
            if(article.make){
              this.doc.text(95, row, 'Marca:')
              this.doc.text(120, row, article.make.description)
            }
            this.doc.text(150, row, 'Precio')
            this.doc.setFontSize(this.fontSizes.extraLarge)
            this.doc.text(150, row + 8,"$" + this.roundNumber.transform(article.salePrice).toString());
            this.doc.setFontSize(this.fontSizes.normal)
            row +=5
            this.doc.text(95, row, 'Categoría:')
            this.doc.text(120, row, article.category.description)
            if(article.otherFields && article.otherFields.length > 0 ){
              for (let fields of article.otherFields){
                row +=5
                this.doc.text(95, row, fields.articleField.name + ":")
                this.doc.text(120, row, fields.value)
              }
            }
            if(article.containsVariants){
              let variants = await this.getVariants(article._id)
              for(let variant of variants){
                row +=5
                this.doc.text(95, row, variant["_id"]["type"]["name"] + ":")
                let col = 110 + variant["_id"]["type"]["name"].length;
                for(let value of  variant["value"] ){
                  this.doc.text(col, row , value["description"])
                  col += 15 + value["description"].length;
                }
              }
            }
            row +=20
            this.doc.line(0, row, 300, row);
            row +=5

            if (count === 5) {

              this.doc.addPage();
  
              var row = 15;
              var margin = 5;
              this.doc.setFontType('bold');
  
              this.doc.setFontSize(12);
              if (this.config[0].companyFantasyName) {
                this.doc.text(this.config[0].companyFantasyName, 5, row);
              }
  
              this.doc.setFontType('normal');
              row += 5;
              if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
                this.doc.text(this.config[0].companyIdentificationType.name + ":", margin, row);
                this.doc.text(this.config[0].companyIdentificationValue, 25, row);
              }
  
              this.doc.setFontType('bold');
              this.centerText(margin, margin, 210, 0, row, "LISTA DE PRECIOS AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY'));
  
              row += 3;
              this.doc.line(0, row, 400, row);
              row += 5;
  
              // Encabezado de la tabla de Detalle de Productos
              this.doc.setFontType('bold');
              this.doc.setFontSize(this.fontSizes.normal);
              this.doc.text("Código", 5 , row);
              this.doc.text("Descripción", 30, row);
              this.doc.text("Marca", 100, row);
              this.doc.text("Rubro", 140, row);
              this.doc.text("Precio", 190, row);
              this.doc.setFontType('normal');
  
              row += 3;
              this.doc.line(0, row, 400, row);
              row += 5;
              count = 0;
            }
        }
      }
      this.finishImpression();
    }
  }

  async getPicture(picture) {

    return new Promise ((resolve, reject) => {
      this._articleService.getPicture(picture).subscribe(
          result => {
            if (!result.imageBase64) {
              this.loading = false;
              resolve(false)
            } else {
              this.imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
              resolve(true);
            }
            this.loading = false;
          },
          error => {
            resolve(false);
          }
      );
    });
  }

  public getVariants(articleId){
    return new Promise<Array<[]>> ((resolve, reject) => {

      let match = `{"articleParent._id" :  { "$oid" : "${articleId}" },"operationType" : { "$ne" : "D" } }`;
  
      match = JSON.parse(match);
  

      let project = {
        "articleParent._id": 1,
        operationType : 1,
        "value.description" : 1,
        "type.name" : 1
      }

      let group = {
        _id: {
          "type" : "$type",
          "articleParent" : "$articleParent"
        },
        count: { $sum: 1 },
        value : { "$addToSet" : "$value"}
      };
      

      this._variantService.getVariantsV2(
        project, // PROJECT
        match, // MATCH
        { description: 1 }, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(
        result =>{
          if(result) {
            resolve(result)
          }
        },
        error => {
          resolve(error);
        }
      )
    });
  }
    

  public finishImpression(): void {

    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
    this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);

  }

  public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {

    if (text) {
      var pageCenter = pdfInMM / 2;

      var lines = this.doc.splitTextToSize(text, (pdfInMM - lMargin - rMargin));
      var dim = this.doc.getTextDimensions(text);
      var lineHeight = dim.h;
      if(lines && lines.length > 0) {
        for (var i = 0; i < lines.length; i++) {
          let lineTop = (lineHeight / 2) * i;
          this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
        }
      }
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { CountryService } from '../../services/country.service'
import { Country } from '../../models/country'
import { CountryComponent } from '../country/country.component'
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-list-countries',
  templateUrl: './list-countries.component.html',
  styleUrls: ['./list-countries.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListCountriesComponent implements OnInit {

  public alertMessage: string = '';
  public userType: string;
  public countries: Country[] = new Array();
  public relationOfCountryEmpty: boolean = true;
  public orderTerm: string[] = ['-code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;

  public itemsPerPage = 10;
  public totalItems = 0;

  public currentPage: number = 0;
  public displayedColumns = [
    "code",
    "name",
    "flag",
    "operationType"
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public alertConfig: NgbAlertConfig,
    public countryService: CountryService,
    public _configService : ConfigService,
    public _router: Router,
    public _modalService: NgbModal,
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
   }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCountries()
  }

  public async importCountry() {

    let countryImport = 0;

    this._configService.getCountry().subscribe(
      async result => {
        let countries = JSON.parse(result["_body"]);

        for (let index = 0; index < countries.length; index++) {
          
          let country = new Country();

          country.code = countries[index]['alpha2Code'];
          country.alpha2Code = countries[index]['alpha2Code'];
          country.alpha3Code = countries[index]['alpha3Code'];
          country.flag = countries[index]['flag'];
          country.name = countries[index]['name'];
          country.callingCodes = countries[index]['callingCodes'][0];
          country.timezones = countries[index]['timezones'][0];

          let result = await this.saveCountry(country)

          if(result){
            countryImport ++;
          }

          this.loading = true;
          
        }
        this.loading = false;
        this.refresh();
      }
    )
    
  }

  public async saveCountry(country:Country){

    return new Promise((resolve, reject) => { 

      this.countryService.saveCountry(country).subscribe(
        result => {
          if (!result.country) {
            this.loading = false;
            if (result.message && result.message !== '') { 
              this.showMessage(result.message, 'info', true); 
            }
          } else {
              this.loading = false;
              resolve(result.country);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    })
  }

  public getCountries() : void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA

    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    match += `"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = '{}';
    if (this.displayedColumns && this.displayedColumns.length > 0) {
        project = '{';
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let field = this.displayedColumns[i];
            project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
            if (i < this.displayedColumns.length - 1) {
                project += ',';
            }
        }
        project += '}';
    }
    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        countries: { $push: "$$ROOT" }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP

    this.countryService.getCountries(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (result.countries) {
          this.loading = false;
          this.countries = result.countries;
          this.totalItems = result.count;
          this.relationOfCountryEmpty = false;
        } 
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getCountries();
  }

  public orderBy(term: string): void {

      if (this.orderTerm[0] === term) {
        this.orderTerm[0] = "-" + term;
      } else {
        this.orderTerm[0] = term;
      }
      this.getCountries();
  }

  public openModal (op: string, country?: Country) : void {

    let modalRef
    switch (op) {
      case 'add':
        modalRef = this._modalService.open(CountryComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "add";
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getCountries();
        }, (reason) => {
          this.getCountries();
        });
        break;
      case 'edit':
        modalRef = this._modalService.open(CountryComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "edit";
        modalRef.componentInstance.countryId = country._id;
        modalRef.componentInstance.readonly = false;
        modalRef.result.then((result) => {
          this.getCountries();
        }, (reason) => {
          this.getCountries();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(CountryComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "delete";
        modalRef.componentInstance.countryId = country._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
          this.getCountries();
        }, (reason) => {
          this.getCountries();
        });
        break;
      case 'view':
        modalRef = this._modalService.open(CountryComponent, { size: 'lg' });
        modalRef.componentInstance.operation = "view";
        modalRef.componentInstance.countryId = country._id;
        modalRef.componentInstance.readonly = true;
        modalRef.result.then((result) => {
        }, (reason) => {
        });
        break;
      default:
        break;
    }

  }

  public refresh(): void {
    this.getCountries();
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


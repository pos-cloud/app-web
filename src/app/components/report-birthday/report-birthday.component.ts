import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from 'app/services/company.service';
import { ConfigService } from './../../services/config.service'

import { Company, CompanyType } from 'app/models/company';
import { Config } from './../../app.config';
import { AddCompanyComponent } from '../add-company/add-company.component';

@Component({
  selector: 'app-report-birthday',
  templateUrl: './report-birthday.component.html',
  styleUrls: ['./report-birthday.component.css'],
  providers: [NgbAlertConfig]
})

export class ReportBirthdayComponent implements OnInit {

  public companies: Company[] = new Array();
  public areArticlesEmpty: boolean = true;
  public alertMessage: string = '';
  public propertyTerm: string;
  public config: Config;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;
  @Input() limit: number = 0;
  public dates: string[] = ["HOY", "ESTE MES", "TODOS"];
  public when: string;
  public listType: string;
  public itemsPerPage: string = "5";
  public currentPage: number = 1;
  public transactionMovement: string;
  public timezone;

  constructor(
    public _companyService: CompanyService,
    public _router: Router,
    public _configService: ConfigService,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
    this.when = "HOY";
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.listType = pathLocation[3];
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);

    this.timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      this.timezone =  Config.timezone.split('UTC')[1];
    }

    this.getBirthday();
  }

  public getBirthday(): void {

    this.loading = true;

    // FILTRAMOS LA CONSULTA
    let match: any = `{ "operationType" : { "$ne" : "D" }`;

    switch(this.when) {
      case 'HOY':
        match += `, "birthday": { "$regex": "${moment(this.startDate, 'YYYY-MM-DD').format('DD/MM')}", "$options": "i"}`;
        break;
      case 'ESTE MES':
        match += `, "birthday": { "$regex": "${moment(this.startDate, 'YYYY-MM-DD').format('/MM/')}", "$options": "i"}`;
        break;
      default:
        match += `, "birthday": { "$ne": null }`;
        break;
    }

    if (this.transactionMovement === "Venta") {
      match += `, "type": "${CompanyType.Client}" `;
    } else if (this.transactionMovement === "Compra") {
      match += `, "type": "${CompanyType.Provider}" `;
    }

    match += `}`;
    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let displayedColumns = [
      "name",
      "birthday",
      "phones",
      "emails",
      "operationType",
      "type"
    ];

    let project = '{}';
    if (displayedColumns && displayedColumns.length > 0) {
      project = '{';
      for (let i = 0; i < displayedColumns.length; i++) {
        let field = displayedColumns[i];
        project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y %H:%M:%S","timezone":"${this.timezone}"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
        if (i < displayedColumns.length - 1) {
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
      companies: { $push: "$$ROOT" }
    };

    this._companyService.getCompaniesV2(
      project, // PROJECT
      match, // MATCH
      { birthday: 1 }, // SORT
      group, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].companies) {
          this.companies = result[0].companies;
        } else {
          this.companies = new Array();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public openModal(op: string, companyId: string): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg' });
        modalRef.componentInstance.companyId = companyId;
        modalRef.componentInstance.readonly = true;
        break;
      default: ;
    }
  };

  public refresh(): void {
    this.getBirthday();
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

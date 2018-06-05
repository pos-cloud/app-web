import { Component, OnInit } from '@angular/core';

import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CompanyService } from './../../services/company.service';

import * as moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [NgbAlertConfig]
})

export class HomeComponent implements OnInit{
  
  public loading: boolean = false;
  public dataChartQuantityOfClients: Array<any>;
  public alertMessage: string = "";
  public chartQuantityOfClientsLabels: Array<any>;
  public chartQuantityOfClientsColors: Array<any>;
  public chartQuantityOfClientsOptions: any;
  public chartQuantityOfClientsData: Array<any>;
  public chartQuantityOfClientsLegend: boolean;
  public chartQuantityOfClientsType: string;
  public startDate: string;
  public startTime: string;
  public endDate: string;
  public endTime: string;
  public view: boolean = false;

  constructor(
    public _companyService: CompanyService,
    public alertConfig: NgbAlertConfig,
  ) {
    this.dataChartQuantityOfClients = new Array();
    this.chartQuantityOfClientsData = new Array();
    this.chartQuantityOfClientsLabels = new Array();
  }

  ngOnInit(): void {

    this.getQuantityOfClients();
    this.startDate = moment().add(-1, "days").format('YYYY-MM-DD');
    this.startTime = moment().add(-1, "days").format('HH:mm:ss');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment().format('HH:mm:ss');
  }

  public getQuantityOfClients(): void {

    this.loading = true;
    this.dataChartQuantityOfClients = new Array();

    let start = this.startDate + "T" + this.startTime + "Z";
    let end = this.endDate + "T" + this.endTime + "Z";

    this._companyService.getQuantityOfCompaniesByType("Cliente", start, end).subscribe(
      result => {
        if (!result.quantityOfComapaniesByType) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.loading = false;
          this.dataChartQuantityOfClients = result.quantityOfComapaniesByType;
          this.initializeChartQuantityOfClients();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public initializeChartQuantityOfClients() {

    let dataClient = new Array();
    let dataDate = new Array();

    for (let i = 0; i < this.dataChartQuantityOfClients.length; i++) {
      dataDate.push(this.dataChartQuantityOfClients[i]._id.month);
      dataClient.push(this.dataChartQuantityOfClients[i].count);
    }

    dataDate = this.getUniqueValues(dataDate);
    
    for(let i = 0; i < dataDate.length; i++) {
      var month = moment(dataDate[i]+"").format('MMMM');
      month = month.charAt(0).toUpperCase() + month.slice(1);
      this.chartQuantityOfClientsLabels.push(month);
    }
    
    // chartQuantityOfClients
    this.chartQuantityOfClientsData = [
      { data: dataClient, 
        label: 'Cliente' 
      }
    ];

    this.chartQuantityOfClientsOptions = {
      responsive: true
    };

    this.chartQuantityOfClientsColors = [
      { // grey
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      },
      { // dark grey
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)'
      }
    ];

    this.chartQuantityOfClientsLegend = true;
    this.chartQuantityOfClientsType = 'line';

    this.view = true;
  }

  public getUniqueValues(array: Array<any>): Array<any> {

    let uniqueArray = new Array();

    for (let index = 0; index < array.length; index++) {
      let el = array[index];
      if (uniqueArray.indexOf(el) === -1) uniqueArray.push(el);
    }

    return uniqueArray;
  }

  public refresh(): void {
    this.getQuantityOfClients();
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
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
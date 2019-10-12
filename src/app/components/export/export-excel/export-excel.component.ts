import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CompanyService } from 'app/services/company.service';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.css']
})
export class ExportExcelComponent implements OnInit {

  @Input() model : any

  @Output() eventRefreshCurrentAccount: EventEmitter<any> = new EventEmitter<any>();
  public roundNumber = new RoundNumberPipe();

  constructor(
    private _companyService : CompanyService
  ) { }

  ngOnInit() {
    
  }

  public export() : void {

    let data = [] ;

    for (let index = 0; index < this.model.length; index++) {
      data[index] = {};

      data[index]['codigo'] = this.model[index]['article']['code']
      if(this.model[index]['article']['make']){
        data[index]['marca'] = this.model[index]['article']['make']['description']
      } else {
        data[index]['marca'] = ''
      }
      data[index]['categoria'] = this.model[index]['article']['category']['description']
      data[index]['descripcion'] = this.model[index]['article']['description']
      data[index]['descripcion corta'] = this.model[index]['article']['posDescription']
      data[index]['costPrice'] = this.roundNumber.transform(this.model[index]['article']['costPrice'])
      data[index]['markupPercentage'] = this.roundNumber.transform(this.model[index]['article']['markupPercentage'])
      data[index]['markupPrice'] = this.roundNumber.transform(this.model[index]['article']['markupPrice'])
      data[index]['salePrice'] = this.roundNumber.transform(this.model[index]['article']['salePrice'])

      data[index]['quantityPerMeasure'] = this.model[index]['article']['quantityPerMeasure']
      if(this.model[index]['article']['unitOfMeasurement']){
        data[index]['unitOfMeasurement'] = this.model[index]['article']['unitOfMeasurement']['abbreviation']
      } else {
        data[index]['unitOfMeasurement'] = ''
      }


      data[index]['total'] = this.model[index]['total']
      data[index]['cantidad'] = this.model[index]['count']

    }

    this._companyService.exportAsExcelFile(data, "Productos mas vendidos");

  }

}

import { Component, OnInit } from '@angular/core';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css']
})
export class PointOfSaleComponent implements OnInit {

  private cashBoxes: CashBox[] = new Array();
  private alertMessage: any;

  constructor(private _cashBoxService: CashBoxService) { }

  ngOnInit() {
  }

  private getOpenCashBoxes(): void {

    this._cashBoxService.getOpenCashBoxes().subscribe(
        result => {
					if(!result.cashBoxes) {
						this.alertMessage = result.message;
					} else {
            this.cashBoxes = result.cashBoxes;
          }
				},
				error => {
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }
}

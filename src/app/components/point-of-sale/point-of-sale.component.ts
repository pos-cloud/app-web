import { Component, OnInit } from '@angular/core';

import { CashBox } from './../../models/cash-box';
import { CashBoxService } from './../../services/cash-box.service';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css']
})
export class PointOfSaleComponent implements OnInit {

  private cashBoxes: CashBox[];
  private alertMessage: any;

  constructor(private _cashBoxService: CashBoxService) { }

  ngOnInit() {
  }

  private getOpenCashBoxes(): void {

    this._cashBoxService.getOpenCashBoxes().subscribe(
        result => {
					this.cashBoxes = result.cashBoxes;
					if(!this.cashBoxes) {
						this.alertMessage = "Error al traer cajas. Error en el servidor.";
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

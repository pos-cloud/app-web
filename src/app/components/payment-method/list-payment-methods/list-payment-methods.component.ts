import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PaymentMethodService } from '../../../core/services/payment-method.service';
import { PaymentMethod } from '../payment-method';

import { PaymentMethodComponent } from '../payment-method/payment-method.component';

@Component({
  selector: 'app-list-payment-methods',
  templateUrl: './list-payment-methods.component.html',
  styleUrls: ['./list-payment-methods.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ListPaymentMethodsComponent implements OnInit {
  public paymentMethods: PaymentMethod[] = new Array();
  public arePaymentMethodsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<PaymentMethod> =
    new EventEmitter<PaymentMethod>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {}

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getPaymentMethods();
  }

  public getPaymentMethods(): void {
    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      (result) => {
        if (!result.paymentMethods) {
          if (result.message && result.message !== '')
            this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.paymentMethods = new Array();
          this.arePaymentMethodsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.paymentMethods = result.paymentMethods;
          this.totalItems = this.paymentMethods.length;
          this.arePaymentMethodsEmpty = false;
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getPaymentMethods();
  }

  public openModal(op: string, paymentMethod: PaymentMethod): void {
    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(PaymentMethodComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.paymentMethodId = paymentMethod._id;
        modalRef.componentInstance.readonly = true;
        break;
      case 'add':
        modalRef = this._modalService.open(PaymentMethodComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then(
          (result) => {
            this.getPaymentMethods();
          },
          (reason) => {
            this.getPaymentMethods();
          }
        );
        break;
      case 'update':
        modalRef = this._modalService.open(PaymentMethodComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.paymentMethodId = paymentMethod._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = 'update';
        modalRef.result.then(
          (result) => {
            this.getPaymentMethods();
          },
          (reason) => {
            this.getPaymentMethods();
          }
        );
        break;
      case 'delete':
        modalRef = this._modalService.open(PaymentMethodComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.paymentMethodId = paymentMethod._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'delete';
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.getPaymentMethods();
            }
          },
          (reason) => {}
        );
        break;
      default:
    }
  }

  public addItem(paymentMethodSelected) {
    this.eventAddItem.emit(paymentMethodSelected);
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

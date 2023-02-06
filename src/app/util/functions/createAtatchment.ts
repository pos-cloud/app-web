import { EmailProps } from 'app/types';
import { PrintTransactionTypeComponent } from '../../components/print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from '../../components/print/print/print.component';
import { Config } from '../../app.config';
import { Transaction } from 'app/components/transaction/transaction';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

export class CreateAtatchment {

  constructor(
    private _modalService:NgbModal
  ){
    //this._modalService= new NgbModal();
  }

  public createAtatchment(transaction:Transaction): string[] {
      const database = localStorage.getItem('company');
      let modalRef;
      if (transaction.type.readLayout) {
        modalRef = this._modalService.open(PrintTransactionTypeComponent);
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.componentInstance.source = 'mail';
      } else {
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.componentInstance.typePrint = 'invoice';
        modalRef.componentInstance.source = 'mail';
      }
      let attachments = [];
      
      if (transaction.type.electronics) {
        attachments.push({
          filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
          path: `/home/clients/${database}/invoice/${transaction._id}.pdf`,
        });
      } else {
        attachments.push({
          filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
          path: `/home/clients/${database}/others/${transaction._id}.pdf`,
        });
      }
      
      if (Config.country === 'MX') {
        attachments.push({
          filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.xml`,
          path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_${transaction.number}.xml`,
        });
      }
      
      if (transaction.type.defectEmailTemplate) {
        if (transaction.type.electronics) {
          attachments = [];
          attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
              path: `/home/clients/${database}/invoice/${transaction._id}.pdf`,
          });
        } else {
          attachments = [];
          attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.pdf`,
              path: `/home/clients/${database}/others/${transaction._id}.pdf`,
          });
        }

        if (Config.country === 'MX') {
          attachments = [];
          attachments.push({
              filename: `${transaction.origin}-${transaction.letter}-${transaction.number}.xml`,
              path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_${transaction.number}.xml`,
          });
        }
      }
      
      return attachments;
      //crear una interface que cumpla con los tipos de attatchment
  }
}
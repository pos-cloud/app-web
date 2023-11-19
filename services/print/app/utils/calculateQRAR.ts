import Config from "../models/config";
import Transaction from "../models/transaction";
import { getQRCode } from "./getQr";

export async function calculateQRAR(transaction: Transaction, config: Config) {
    let url = 'https://www.afip.gob.ar/fe/qr/?p=';
    let datos: any = {};

    let codeInvoice;

    if (transaction.type.codes && transaction.type.codes.length > 0) {
      for (let y: number = 0; y < transaction.type.codes.length; y++) {
        if (transaction.letter == transaction.type.codes[y].letter) {
          codeInvoice = transaction.type.codes[y].code;
        }
      }
    }

    datos['ver'] = 1;
    datos['fecha'] = transaction.CAEExpirationDate ?? transaction['endDate']
    datos['cuit'] = config.companyIdentificationValue.replace('-', '');
    datos['ptoVta'] = transaction.origin;
    datos['tipoCmp'] = codeInvoice;
    datos['nroCmp'] = transaction.number;
    datos['importe'] = transaction.totalPrice;
    datos['moneda'] = 'PES';
    datos['ctz'] = 1;
    datos['tipoCodAut'] = 'E';
    datos['tipoDocRec'] = 80
    datos['nroDocRec'] = config.companyIdentificationValue.replace('-', '');
    datos['codAut'] = transaction.CAE;

    let objJsonB64 = btoa(JSON.stringify(datos));

   url += objJsonB64; 
 
  const response = await getQRCode(url)
   return response 
  }
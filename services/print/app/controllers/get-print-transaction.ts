import { Response } from "express";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { getTransactionById } from "../services/transaction.services";
import { getPrinters } from "../services/printers.services";
import { getConfig } from "../services/config.services";
import { formatDate } from "../utils/formateDate";
import { padString } from "../utils/padString";
import { getMovementsOfArticle } from "../services/movements-of-articles.services";
import Transaction from "../models/transaction";
import Config from "../models/config";
import { calculateQRAR } from "../utils/calculateQRAR";
import { transform, formatNumber } from "../utils/format-numbers";
import { getMovementsOfCash } from "../services/movements-of-cash.services";
import MovementOfCash from "../models/movement-of-cash";
import { getCompanyPictureFromGoogle } from "../services/get-picture.services";
import MovementOfArticle from "../models/movements-of-articles";
import Printer from "models/printer";
import { getBarcode } from "../utils/getBarcode";
const fs = require('fs');
const { jsPDF } = require("jspdf");

async function header(doc: any, transaction: Transaction, config: Config, movementsOfArticles: MovementOfArticle[], printer: Printer, companyImg: string) {
  if (printer.pageWidth < 150) {
    if (companyImg !== null) {
      doc.addImage(companyImg, 'png', 12, 6, 62, 36)
    } else {
      doc.setFontSize(15)
      doc.setFont("helvetica", "bold");
      config.companyFantasyName.length > 0
        ? doc.text(config.companyFantasyName.slice(0, 19), 20, 8)
        : ''
      config.companyFantasyName.length > 19
        ? doc.text(config.companyFantasyName.slice(19, 40), 20, 13)
        : '';
      config.companyFantasyName.length > 40
        ? config.companyFantasyName.slice(32, 105)
        : '';

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);

      doc.line(0, 15, 100, 15, "FD"); // Línea Vertical

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`Razón Social:  ${config.companyName}`, 5, 25);
      doc.text(`Domicilio Comercial:   ${config.companyAddress}`, 5, 30);
      doc.text(`Cliente:   ${config.companyVatCondition?.description || ""}`, 5, 35);
      doc.text(`C.U.I.T: ${config.companyIdentificationValue}`, 5, 40);
      doc.setFont("helvetica", "normal");
    }

    if (transaction.type.electronics && movementsOfArticles.length) {
      doc.line(0, 43, 100, 43, "FD"); // Línea Vertical
      doc.setFont("times", "bold");
      doc.setFontSize(28);
      doc.text(transaction.letter, 20, 51);
      if (transaction.type.codes && config.country === 'AR') {
        for (let i = 0; i < transaction.type.codes.length; i++) {
          if (
            transaction.type.codes[i].code &&
            transaction.letter === transaction.type.codes[i].letter
          ) {
            doc.setFontSize(5);
            doc.text('Cod.' + padString(transaction.type.codes[i].code.toString(), 2), 20, 54);
          }
        }
      }
      doc.setFontSize(10);
      doc.text('ORIGINAL', 15, 57);

      doc.setFontSize(12);
      doc.text(`${transaction.type.labelPrint ? transaction.type.labelPrint : transaction.type.name}`, 45, 50)

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      if (config.country === 'AR') {
        doc.text(
          'N°:' +
          padString(transaction.origin, 4) +
          '-' +
          padString(transaction.number, 8),
          45,
          54
        );
      } else {
        doc.text('N°:' + padString(transaction.number, 8), 45, 54);
      }

      doc.text(transaction.endDate ? transaction.endDate.split(' ')[0] : '', 45, 57);

      doc.line(0, 59, 100, 59, "FD"); // Línea Vertical
      doc.text(`Cliente:   ${transaction.company ? transaction.company.fantasyName : ""}`, 9, 63);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.line(0, 65, 100, 65, "FD"); // Línea Vertical

      doc.text('Cant.', 3, 70);
      doc.text('Descripción', 15, 70);
      doc.text('P. unitario', 45, 70);
      doc.text('Total', 70, 70);

      doc.line(0, 74, 100, 74, "FD"); // Línea Vertical
    } else if (!transaction.type.electronics && !movementsOfArticles.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.line(0, 48, 100, 48, "FD"); // Línea Vertical
      if (transaction.endDate) {
        doc.text(
          'Hora: ' +
          transaction.endDate.substring(11, 13) +
          ':' +
          transaction.endDate.substring(14, 16) +
          ':' +
          transaction.endDate.substring(17, 19),
          45,
          56
        );
      }

      doc.text(`Fecha: ${formatDate(transaction.startDate)} `, 45, 53);

      doc.setFont("helvetica", "bold");

      doc.text(`Cobro N°:  ${transaction.orderNumber > 0 ? transaction.orderNumber : transaction.number}`, 9, 53)
      doc.text(`Cliente: ${transaction.company ? transaction.company.fantasyName : "Consumidor Final"}`, 9, 61);

      doc.line(0, 65, 100, 65, "FD"); // Línea Vertical

      doc.text('Descripcion', 9, 70);
      doc.text('Importe', 64, 70);

      doc.line(0, 74, 100, 74, "FD"); // Línea Vertical
    } else if (!transaction.type.electronics && movementsOfArticles.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.line(0, 48, 100, 48, "FD"); // Línea Vertical
      if (transaction.endDate) {
        doc.text(
          'Hora: ' +
          transaction.endDate.substring(11, 13) +
          ':' +
          transaction.endDate.substring(14, 16) +
          ':' +
          transaction.endDate.substring(17, 19),
          45,
          56
        );
      }

      doc.text(`Fecha: ${formatDate(transaction.startDate)} `, 45, 53);

      doc.setFont("helvetica", "bold");
      doc.text(`Pedido N°:  ${transaction.orderNumber > 0 ? transaction.orderNumber : transaction.number}`, 9, 53)

      doc.text(`Cliente: ${transaction.VatCondition?.description || "Consumidor Final"}`, 9, 61);

      doc.line(0, 65, 100, 65, "FD"); // Línea Vertical

      doc.text('Descripcion', 9, 70);
      doc.text('Importe', 64, 70);

      doc.line(0, 74, 100, 74, "FD"); // Línea Vertical
    }
  } else {
    if (companyImg === null) {
      doc.setFontSize(15)
      doc.setFont("helvetica", "bold");
      config.companyFantasyName.length > 0
        ? doc.text(config.companyFantasyName.slice(0, 19), 15, 16)
        : ''
      config.companyFantasyName.length > 19
        ? doc.text(config.companyFantasyName.slice(19, 40), 15, 23)
        : '';
      config.companyFantasyName.length > 40
        ? config.companyFantasyName.slice(32, 105)
        : '';
    } else {
      doc.addImage(companyImg, 'png', 15, 8, 60, 26)
    }

    doc.line(4, 6, 4, 48, "FD"); // Línea Vertical
    doc.line(205, 6, 205, 48, "FD"); // Línea Vertical
    doc.line(4, 48, 205, 48, "FD"); // Línea Horizontal
    doc.line(4, 6, 205, 6, "FD"); // Línea Horizontal

    doc.line(107, 20, 107, 48); // Línea Vertical Medio
    doc.line(99, 20, 115, 20, "FD"); // Línea Horizontal Medio
    doc.line(99, 6, 99, 20, "FD"); // Línea Vertical Medio
    doc.line(115, 6, 115, 20, "FD"); // Línea Vertical Medio
    doc.line(99, 6, 115, 6, "FD"); // Línea Horizontal Medio

    doc.line(4, 51, 205, 51, "FD"); // Línea Horizontal
    doc.line(4, 51, 4, 65, "FD"); // Línea Vertical
    doc.line(205, 51, 205, 65, "FD"); // Línea Vertical
    doc.line(4, 65, 205, 65, "FD"); // Línea Horizontal

    // CONTENIDO
    if (movementsOfArticles.length) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");

      doc.line(4, 68, 205, 68, "FD"); // Línea Horizontal
      doc.line(4, 68, 4, 74, "FD"); // Línea Vertical
      doc.line(205, 68, 205, 74, "FD"); // Línea Vertical
      doc.line(4, 74, 205, 74, "FD"); // Línea Horizontal

      doc.line(15, 68, 15, 74, "FD"); // Línea Vertical
      doc.line(41, 68, 41, 74, "FD"); // Línea Vertical
      doc.line(127, 68, 127, 74, "FD"); // Línea Vertical
      doc.line(151, 68, 151, 74, "FD"); // Línea Vertical

      doc.text('Cant.', 6, 72);
      doc.text('Código', 17, 72);
      doc.text('Descripción', 42, 72);
      doc.text('Precio U.', 129, 72);
      doc.text('desc %.', 153, 72);
      // Columnas
      if (transaction.type.electronics) {
        doc.line(171, 68, 171, 74, "FD"); // Línea Vertical
        doc.line(182, 68, 182, 74, "FD"); // Línea Vertical

        doc.text('IVA', 173, 72);
        doc.text('Precio total', 184, 72);
      } else {
        doc.line(151, 68, 151, 74, "FD"); // Línea Vertical
        doc.line(176, 68, 176, 74, "FD"); // Línea Vertical

        doc.text('Precio total', 178, 72);
      }
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.line(4, 68, 205, 68, "FD"); // Línea Horizontal
      doc.line(4, 68, 4, 74, "FD"); // Línea Vertical
      doc.line(205, 68, 205, 74, "FD"); // Línea Vertical
      doc.line(4, 74, 205, 74, "FD"); // Línea Horizontal

      // Columnas
      doc.line(71, 68, 71, 74, "FD"); // Línea Vertical
      doc.line(100, 68, 100, 74, "FD"); // Línea Vertical
      doc.line(130, 68, 130, 74, "FD"); // Línea Vertical
      doc.line(175, 68, 175, 74, "FD"); // Línea Vertical

      doc.text('Detalle', 6, 72);
      doc.text('Vencimiento', 73, 72);
      doc.text('Número', 102, 72);
      doc.text('Banco', 132, 72);
      doc.text('Total', 177, 72);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Razón Social:  ${config.companyName}`, 9, 38);
    doc.text(`Domicilio Comercial:   ${config.companyAddress}`, 9, 42);
    doc.text(`Condición de IVA:   ${config.companyVatCondition?.description || ""}`, 9, 46);
    doc.text(`Punto de Venta: ${padString(transaction.origin, 4)}`, 120, 26);
    doc.text(`Comp. Nro: ${padString(transaction.number, 10)}`, 165, 26);
    doc.text(`Fecha de Emisión: ${formatDate(transaction.startDate)} `, 120, 30);

    doc.text(`C.U.I.T: ${config.companyIdentificationValue}`, 120, 38);
    doc.text(`Ingresos Brutos: ${config.companyGrossIncome}`, 120, 42);
    doc.text(`Inicio de Actividades: ${formatDate(config.companyStartOfActivity)}`, 120, 46);

    // Labels Segundo Cuadro
    doc.setFontSize(8.9);
    doc.text(`C.U.I.T: ${transaction.company?.CUIT || ""}`, 9, 57);
    doc.text(`Condición de IVA: ${transaction.VatCondition?.description || "Consumidor Final"}`, 9, 62);
    doc.text(`Razón Social: ${transaction.company?.name || ""}`, 87, 57);
    doc.text(`Domicilio Comercial:  ${transaction.company?.address || ""}`, 87, 62);

    doc.setFontSize(20);

    doc.text(transaction.letter, 104.5, 14);
    doc.text(transaction.type.name, 130, 16);

    doc.setFontSize(8);

    if (transaction.type.codes && config.country === 'AR') {
      for (let i = 0; i < transaction.type.codes.length; i++) {
        if (
          transaction.type.codes[i].code &&
          transaction.letter === transaction.type.codes[i].letter
        ) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(
            'Cod.' + padString(transaction.type.codes[i].code.toString(), 2),
            102.4,
            18
          );
        }
      }
    }
  }
}

async function footer(doc: any, transaction: Transaction, qrDate: string, movementsOfCash: MovementOfCash[], movementsOfArticles: MovementOfArticle[], printer: Printer, row: number) {
  let fila = row;

  if (printer.pageWidth < 150) {
    if (movementsOfCash && movementsOfArticles.length && !transaction.type.electronics) {
      if (transaction.discountAmount) {
        fila += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text('DESCUENTO', 6, fila);
        doc.text(`-$${transaction.discountAmount}`, 62, fila);
      }

      if (movementsOfCash) {
        fila += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text('Forma de Pago:', 6, fila);
        for (let i = 0; i < movementsOfCash.length; i++) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          doc.text(`${movementsOfCash[i].type ? movementsOfCash[i].type.name : ''}: $${formatNumber(movementsOfCash[i].amountPaid)}`, 6, fila + 5);
          fila += 5;
        }
        fila += 9;
        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text(`TOTAL $ ${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''}`, 22, fila);
      }
    } else if (movementsOfCash && movementsOfArticles && transaction.type.electronics) {
      fila += 8;
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text(`TOTAL $ ${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''}`, 50, fila);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      fila += 5;
      doc.text('Forma de Pago:', 5, fila);

      for (let i = 0; i < movementsOfCash.length; i++) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(` $${formatNumber(movementsOfCash[i].amountPaid)}`, 5, fila + 5);
        doc.text(`${movementsOfCash[i].type ? movementsOfCash[i].type.name : ''}`, 35, fila + 5);
        fila += 5;
      }

      if (transaction.discountAmount) {
        fila += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text('DESCUENTO', 6, fila);
        doc.text(`-$${transaction.discountAmount}`, 62, fila);
      }
      fila += 3;
      doc.line(0, fila, 100, fila, "FD"); // Línea Vertical
      if (transaction.CAE && transaction.CAEExpirationDate) {
        fila += 3;
        doc.addImage(qrDate, 'png', 2, fila, 33, 33);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        fila += 25;
        doc.text(`CAE: ${transaction?.CAE || ''}`, 36, fila);
        doc.text(transaction.CAEExpirationDate !== undefined ? `Fecha Vto: ${formatDate(transaction?.CAEExpirationDate)}` : 'Fecha Vto:', 36, fila + 5);
      }
    } else {
      fila += 11;
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text(`TOTAL $ ${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''}`, 22, fila);
    }
  } else {
    if (movementsOfCash && movementsOfArticles.length) {
      doc.line(6, 225, 205, 225, "FD"); // Línea Horizontal
      doc.line(6, 225, 6, 290, "FD"); // Línea Vertical
      doc.line(205, 225, 205, 290, "FD"); // Línea Vertical
      doc.line(6, 290, 205, 290, "FD"); // Línea Horizontal

      doc.line(8, 227, 133, 227, "FD"); // Línea Horizontal
      doc.line(8, 227, 8, 231, "FD"); // Línea Vertical
      doc.line(133, 227, 133, 231, "FD"); // Línea Vertical
      doc.line(8, 231, 133, 231, "FD"); // Línea Horizontal

      doc.line(43, 227, 43, 231, "FD"); // Línea Vertical
      doc.line(110, 227, 110, 231, "FD"); // Línea Vertical

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text('Forma de pago', 10, 230);
      doc.text('Detalle', 45, 230);
      doc.text('Importe', 112, 230);

      doc.setFont("helvetica", "normal");

      let verticalPosition = 235;
      for (let i = 0; i < movementsOfCash.length; i++) {
        doc.text(movementsOfCash[i].type.name, 10, verticalPosition);
        doc.text(`$${formatNumber(movementsOfCash[i].amountPaid)}`, 112, verticalPosition);
        movementsOfCash[i].observation.length > 0
          ? doc.text(`${movementsOfCash[i].observation.slice(0, 30)}-`, 44, verticalPosition)
          : '';
        if (movementsOfCash[i].observation.length > 35) {
          doc.text(`${movementsOfCash[i].observation.slice(30, 105)}-`, 44, (verticalPosition + 4)) || '';
          verticalPosition += 8;
        } else {
          verticalPosition += 4;
        }
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text('Subtotal:', 138, 235);
      doc.text('Descuento:', 138, 241);

      if (transaction) {
        let texBase = 0;
        let percentage = 0;
        let verticalPosition = 254;

        for (let i = 0; i < transaction.taxes.length; i++) {
          texBase += transaction.taxes[i].taxBase;
          percentage += 1 + transaction.taxes[i].percentage / 100;
          if (transaction.type.electronics) {
            doc.setFont("helvetica", "normal");
            doc.text(`$${transaction.taxes[i].taxAmount ? formatNumber(transaction.taxes[i].taxAmount) : ''}`, 179, verticalPosition);
            doc.setFont("helvetica", "bold");
            doc.text(transaction.taxes[i].tax.name, 138, verticalPosition);
          }
          verticalPosition += 7;
        }
        verticalPosition += 0, 5;

        if (transaction.type.electronics) {
          doc.setFont("helvetica", "bold");
          doc.text('Neto Gravado:', 138, 247);
          doc.text('Total:', 138, verticalPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`$${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''} `, 179, verticalPosition);
          doc.text(`${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''} `, 179, 235);
          doc.text(`$${texBase ? formatNumber(texBase) : ''}`, 179, 247);
          doc.text(`${transaction.discountAmount / percentage > 0 ? `$${transform(transaction.discountAmount / percentage, 2)}` : ''}`, 179, 241);
        } else {
          doc.text('Total:', 138, 246);
          doc.text(`${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''} `, 179, 235);
          doc.text(`$${transaction.totalPrice ? formatNumber(transaction.totalPrice) : ''} `, 179, 246);
          doc.text(`${transaction.discountAmount / percentage > 0 ? `$${transform(transaction.discountAmount / percentage, 2)}` : ''}`, 179, 241);
        }
      }

      if (transaction.CAE && transaction.CAEExpirationDate) {
        doc.addImage(qrDate, 'png', 9, 251, 35, 35);
        doc.setFont("helvetica", "bold");
        doc.text(`CAE N°: ${transaction?.CAE || ''}`, 45, 277);
        doc.text(transaction.CAEExpirationDate !== undefined ? `Fecha de Vto. CAE: ${formatDate(transaction?.CAEExpirationDate)}` : 'Fecha de Vto. CAE:', 45, 282);
      }
    } else {
      doc.line(6, 250, 205, 250, "FD"); // Línea Horizontal
      doc.line(6, 250, 6, 290, "FD"); // Línea Vertical
      doc.line(205, 250, 205, 290, "FD"); // Línea Vertical
      doc.line(6, 290, 205, 290, "FD"); // Línea Horizontal

      if (transaction.type.printSign) {
        doc.line(80, 267, 130, 267);
        doc.setFontSize(10);
        doc.text('FIRMA CONFORME', 88, 273);
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text('Total:', 138, 257);
        doc.setFont("helvetica", "normal");
        doc.text(`$${formatNumber(transaction.totalPrice)} ` || '', 179, 257);
      }
    }

    if (transaction.observation.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text('Observaciones:', 9, 280);
      doc.setFont("helvetica", "normal");
      let row = 280;
      transaction.observation.length > 0
        ? doc.text(transaction.observation.slice(0, 45) + '-', 37, row)
        : '';
      transaction.observation.length > 45
        ? doc.text(transaction.observation.slice(45, 105) + '-', 37, (row += 4))
        : '';
    }
  }
}

async function toPrintInvoice(doc: any, transaction: Transaction, movementsOfCashs: MovementOfCash[], movementsOfArticles: MovementOfArticle[], printer: Printer, config: Config, qrDate: string, companyImg: string) {

  let verticalPosition = 79;
  let articlesPerPage = 26;
  let articlesOnCurrentPage = 0;
  let currentPage = 1;
  let row = 75

  var x = doc.internal.pageSize.width - 20
  if (movementsOfArticles.length > 0 && movementsOfCashs || movementsOfArticles.length > 0 && !movementsOfCashs) {
    for (let i = 0; i < movementsOfArticles.length; i++) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold");
      const movementsOfArticle = movementsOfArticles[i];
      if (articlesOnCurrentPage >= articlesPerPage) {
        header(doc, transaction, config, movementsOfArticles, printer, companyImg);

        if (i !== movementsOfArticles.length - 1) {
          doc.addPage();
          currentPage++;
          verticalPosition = 84;
          articlesOnCurrentPage = 0;
        }
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);

      doc.text(movementsOfArticle.notes || "", 44, verticalPosition + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      doc.text(`${movementsOfArticle.amount}`, 6, verticalPosition);
      doc.text(movementsOfArticle.code, 17, verticalPosition);
      movementsOfArticle.description.length > 0
        ? doc.text(movementsOfArticle.description.slice(0, 55), 42, verticalPosition) : ''
      movementsOfArticle.description.length > 55
        ? movementsOfArticle.description.slice(55, 105)
        : '';
      doc.text(`$ ${formatNumber(movementsOfArticle.unitPrice)}`, 134, verticalPosition);
      if (transaction.type.electronics) {
        doc.text(movementsOfArticle.taxes[0]?.percentage !== undefined ? `${movementsOfArticle.taxes[0]?.percentage}%` : "", 173, verticalPosition);
      }
      doc.text(`${movementsOfArticle.discountRate}%`, 153, verticalPosition)
      doc.text(`$ ${formatNumber(movementsOfArticle.salePrice)}`, 190, verticalPosition);

      if (movementsOfArticle.notes) {
        verticalPosition += 9;
        articlesOnCurrentPage++;
      } else {
        verticalPosition += 6;
        articlesOnCurrentPage++;
      }
    }

    header(doc, transaction, config, movementsOfArticles, printer, companyImg);
    footer(doc, transaction, qrDate, movementsOfCashs, movementsOfArticles, printer, row);

  } else if (!movementsOfArticles.length && movementsOfCashs || !movementsOfArticles.length && !movementsOfCashs) {
    if (movementsOfCashs) {
      for (let i = 0; i < movementsOfCashs.length; i++) {
        const movementsOfCash = movementsOfCashs[i];
        if (articlesOnCurrentPage >= articlesPerPage) {
          header(doc, transaction, config, movementsOfArticles, printer, companyImg);

          if (i !== movementsOfCashs.length - 1) {
            doc.addPage();
            currentPage++;
            verticalPosition = 84;
            articlesOnCurrentPage = 0;
          }
        }

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);

        doc.text(movementsOfCash.observation || "", 8, verticalPosition + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(`${movementsOfCash.type.name}`, 6, verticalPosition);
        doc.text(formatDate(movementsOfCash.expirationDate), 73, verticalPosition);
        doc.text(movementsOfCash.number || '-', 102, verticalPosition);
        doc.text(movementsOfCash.bank ? movementsOfCash.bank.name : '-', 132, verticalPosition);
        doc.text(`$ ${movementsOfCash.amountPaid}`, 177, verticalPosition);

        if (movementsOfCash.observation) {
          verticalPosition += 9;
          articlesOnCurrentPage++;
        } else {
          verticalPosition += 6;
          articlesOnCurrentPage++;
        }
      }
    }
    header(doc, transaction, config, movementsOfArticles, printer, companyImg);
    footer(doc, transaction, qrDate, movementsOfCashs, movementsOfArticles, printer, row);
  }
}

async function toPrintRoll(doc: any, transaction: Transaction, movementsOfCashs: MovementOfCash[], movementsOfArticles: MovementOfArticle[], printer: Printer, config: Config, qrDate: string, companyImg: string) {

  let verticalPosition = 79;
  let articlesPerPage = 200;
  let articlesOnCurrentPage = 0;
  let currentPage = 1;
  let row = 75

  if (movementsOfArticles.length > 0 && movementsOfCashs || movementsOfArticles.length > 0 && !movementsOfCashs) {
    if (transaction.type.electronics) {
      for (let i = 0; i < movementsOfArticles.length; i++) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold");
        const movementsOfArticle = movementsOfArticles[i];
        if (articlesOnCurrentPage >= articlesPerPage) {
          header(doc, transaction, config, movementsOfArticles, printer, companyImg);

          if (i !== movementsOfArticles.length - 1) {
            doc.addPage();
            currentPage++;
            verticalPosition = 88;
            articlesOnCurrentPage = 0;
          }
        }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);

        doc.text(movementsOfArticle.notes || "", 44, verticalPosition + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        doc.text(`${movementsOfArticle.amount}`, 4, verticalPosition);
        movementsOfArticle.description.length > 0
          ? doc.text(movementsOfArticle.description.slice(0, 20), 12, verticalPosition) : ''
        movementsOfArticle.description.length > 20
          ? movementsOfArticle.description.slice(20, 105)
          : '';
        doc.text(`$ ${formatNumber(movementsOfArticle.unitPrice)}`, 50, verticalPosition);
        doc.text(`$ ${formatNumber(movementsOfArticle.salePrice)}`, 68, verticalPosition);

        if (movementsOfArticle.notes) {
          verticalPosition += 9;
          articlesOnCurrentPage++;
        } else {
          verticalPosition += 6;
          articlesOnCurrentPage++;
        }
        row += 6
      }
      doc.line(0, row + 4, 100, row + 4, "FD"); // Linea Vertical
      header(doc, transaction, config, movementsOfArticles, printer, companyImg);
      footer(doc, transaction, qrDate, movementsOfCashs, movementsOfArticles, printer, row);
    } else {
      for (let i = 0; i < movementsOfArticles.length; i++) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold");
        const movementsOfArticle = movementsOfArticles[i];
        if (articlesOnCurrentPage >= articlesPerPage) {
          header(doc, transaction, config, movementsOfArticles, printer, companyImg);

          if (i !== movementsOfArticles.length - 1) {
            doc.addPage();
            currentPage++;
            verticalPosition = 84;
            articlesOnCurrentPage = 0;
          }
        }
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6);

        doc.text(movementsOfArticle.notes || "", 4, verticalPosition + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        doc.text(`${movementsOfArticle.amount} X ${movementsOfArticle.unitPrice}`, 4, verticalPosition + 3);
        movementsOfArticle.description.length > 0
          ? doc.text(movementsOfArticle.description.slice(0, 35), 4, verticalPosition) : ''
        movementsOfArticle.description.length > 35
          ? movementsOfArticle.description.slice(35, 105)
          : '';
        doc.text(`$ ${formatNumber(movementsOfArticle.salePrice)}`, 64, verticalPosition);

        if (movementsOfArticle.notes) {
          verticalPosition += 9;
          articlesOnCurrentPage++;
        } else {
          verticalPosition += 6;
          articlesOnCurrentPage++;
        }
        row += 6
      }

      doc.line(0, row + 4, 100, row + 4, "FD"); // Linea Vertical
      header(doc, transaction, config, movementsOfArticles, printer, companyImg);
      footer(doc, transaction, qrDate, movementsOfCashs, movementsOfArticles, printer, row);
    }
  } else if (!movementsOfArticles.length && movementsOfCashs || !movementsOfArticles.length && !movementsOfCashs) {
    if (movementsOfCashs) {
      for (let i = 0; i < movementsOfCashs.length; i++) {
        const movementsOfCash = movementsOfCashs[i];
        if (articlesOnCurrentPage >= articlesPerPage) {
          header(doc, transaction, config, movementsOfArticles, printer, companyImg);

          if (i !== movementsOfCashs.length - 1) {
            doc.addPage();
            currentPage++;
            verticalPosition = 84;
            articlesOnCurrentPage = 0;
          }
        }

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);

        doc.text(movementsOfCash.observation || "", 8, verticalPosition + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);

        doc.text(`${movementsOfCash.type.name}`, 6, verticalPosition);
        doc.text(`$ ${movementsOfCash.amountPaid}`, 64, verticalPosition);

        if (movementsOfCash.observation) {
          verticalPosition += 9;
          articlesOnCurrentPage++;
        } else {
          verticalPosition += 6;
          articlesOnCurrentPage++;
        }
      }
      row += 8
    }
    doc.line(0, row + 4, 100, row + 4, "FD"); // Linea Vertical
    header(doc, transaction, config, movementsOfArticles, printer, companyImg);
    footer(doc, transaction, qrDate, movementsOfCashs, movementsOfArticles, printer, row);
  }
}

export async function getPrintTransaction(
  req: RequestWithUser,
  res: Response
) {
  const transactionId: string = req.query.transactionId as string;
  const token = req.headers.authorization

  try {
    const configs = await getConfig(token);
    const config = configs[0]
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    const transaction = await getTransactionById(transactionId, token);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const qrDate = await calculateQRAR(transaction, config)

    const movementOfArticles = await getMovementsOfArticle(transactionId, token)

    const movementsOfCashs = await getMovementsOfCash(token, transactionId)

    let doc;

    if (transaction.type.defectPrinter) {
      const printer = transaction.type.defectPrinter
      const pageWidth = printer.pageWidth;
      const pageHigh = printer.pageHigh;
      const units = "mm";
      const orientation = printer.orientation;
      doc = new jsPDF(orientation, units, [pageWidth, pageHigh]);

      for (const movementOfArticle of movementOfArticles) {
        for (const field of printer.fields) {
          switch (field.type) {
            case 'label':
              if (field.font !== 'default') {
                doc.setFont(field.font, field.fontType);
              }
              doc.setFontSize(field.fontSize);
              doc.text(field.positionStartX, field.positionStartY, field.value);
              break;
            case 'line':
              doc.setLineWidth(field.fontSize);
              doc.line(field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
              break;
            case 'image':
              try {
                const img = await getCompanyPictureFromGoogle(eval(field.value));
                doc.addImage(img, 'png', field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
              } catch (error) {
                console.log(error);
              }
              break;
            case 'barcode':
              doc.text('hello', 6, 6)
              // try {
              //   const response = await getBarcode('code128', eval(field.value));
              //   doc.addImage(response, 'png', field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
              // } catch (error) {
              //   console.log(error);
              // }
              break;
            case 'data':
              if (field.font !== 'default') {
                doc.setFont(field.font, field.fontType);
              }
              doc.setFontSize(field.fontSize)
              try {
                if (field.positionEndX || field.positionEndY) {
                  doc.text(field.positionStartX, field.positionStartY, eval(field.value).toString().slice(field.positionEndX, field.positionEndY))
                } else {
                  doc.text(field.positionStartX, field.positionStartY, eval(field.value).toString())
                }
              } catch (e) {
                doc.text(field.positionStartX, field.positionStartY, " ")
              }
              break;
            case 'dataEsp':
              if (field.font !== 'default') {
                doc.setFont(field.font, field.fontType);
              }
              doc.setFontSize(field.fontSize);
              try {
                const text = field.positionEndX || field.positionEndY
                  ? eval(field.value).toString().slice(field.positionEndX, field.positionEndY)
                  : eval(field.value).toString();
                doc.text(field.positionStartX, field.positionStartY, text);
              } catch (e) {
                doc.text(field.positionStartX, field.positionStartY, " ");
              }
              break;
            default:
              break;
          }
        }
      }
    } else {
      let printer = await getPrinters(token, "Mostrador");
      if (!printer) {
        return res.status(404).json({ message: "Printer not found" });
      }
      const pageWidth = printer.pageWidth;
      const pageHigh = printer.pageHigh;
      const units = "mm";
      const orientation = printer.orientation;
      doc = new jsPDF(orientation, units, [pageWidth, pageHigh]);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      let companyImg = null
      await getCompanyPictureFromGoogle(config.companyPicture)
        .then((imgData) => {
          companyImg = imgData
        })
        .catch(error => {
          console.error('Error al obtener la imagen:', error);
        })

      if (printer.pageWidth > 150) {
        toPrintInvoice(doc, transaction, movementsOfCashs, movementOfArticles, printer, config, qrDate, companyImg)
      } else if (printer.pageWidth < 150) {
        toPrintRoll(doc, transaction, movementsOfCashs, movementOfArticles, printer, config, qrDate, companyImg)
      }
    }

    doc.autoPrint();
    doc.save(`transaction-${transactionId}.pdf`)

    const pdfPath = `transaction-${transactionId}.pdf`;

    if (fs.existsSync(pdfPath)) {
      res.contentType("application/pdf");
      res.setHeader('Content-Disposition', `inline; filename=./transaction-${transactionId}.pdf`);

      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        fs.unlink(pdfPath, (err: any) => {
          if (err) {
            console.error(`Error al eliminar el archivo ${pdfPath}: ${err}`);
          } else {
            console.log(`Archivo ${pdfPath} eliminado con éxito.`);
          }
        });
      })
    } else {
      res.status(404).send('PDF no encontrado');
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
}
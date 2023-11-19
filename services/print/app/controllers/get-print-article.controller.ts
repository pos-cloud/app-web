import { Response } from "express";
import { getArticleData } from "../services/article.services";
import { getPrinters } from "../services/printers.services";
import RequestWithUser from "../interfaces/requestWithUser.interface";
import { getBarcode } from "../utils/getBarcode";
import {getCompanyPictureFromGoogle } from "../services/get-picture.services";
import { getConfig } from "../services/config.services";
const { jsPDF } = require("jspdf");
const fs = require('fs');

 export async function getPrintArticle(
  req: RequestWithUser,
  res: Response
 ) {
  const token = req.headers.authorization
  const articleId: string = req.query.articleId as string;
  const quantity: string = req.query.quantity as string;

  try {
    const configs = await getConfig(token);
    const config = configs[0]
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }
    if(!quantity){
      return res.status(404).json({ message: "no quantity found" });
    }
    const article = await getArticleData(articleId, token);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    const printer = await getPrinters(token, "Etiqueta");

    if (!printer) {
      return res.status(404).json({ message: "Printer not found" });
    }

    const pageWidth = printer.pageWidth;
    const pageHigh = printer.pageHigh;
    const units = 'mm';
    const orientation = printer.orientation;
    const doc = new jsPDF(orientation, units, [pageWidth, pageHigh]);

      for (let index = 0; index < parseInt(quantity); index++) {
        if (index > 0) {
          doc.addPage();
        }
          for (const field of printer.fields) {
            switch (field.type) {
              case 'label':
                if (field.font !== 'default') {
                  doc.setFont(field.font, field.fontType);
                }
                doc.setFontSize(field.fontSize);
                doc.text(field.positionStartX, field.positionStartY, eval(field.value));
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
                try {
                  const response = await getBarcode('code128', eval(field.value));
                  doc.addImage(response, 'png', field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
                } catch (error) {
                  console.log(error);
                }
                break;
              case 'data':
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

    doc.autoPrint();
    doc.save(`article-${articleId}.pdf`)

    const pdfPath = `article-${articleId}.pdf`;

    if (fs.existsSync(pdfPath)) {
      res.contentType("application/pdf");
      res.setHeader('Content-Disposition', `inline; filename=./article-${articleId}.pdf`);

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
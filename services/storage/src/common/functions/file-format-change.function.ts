import { Readable } from 'stream'; // Importa Readable desde 'stream'

import { FileUpload } from "../interfaces/file.type";

export const FileFormatChange = (file: Express.Multer.File): FileUpload => {
  const { originalname, mimetype, encoding } = file;

  const fileUpload: FileUpload = {
    filename: originalname,
    mimetype: mimetype,
    encoding: encoding,
    createReadStream: () => {
      // Envuelve el buffer dentro de un stream legible
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null); // Señal de fin de archivo
      return stream;
    }
  };

  return fileUpload;
};

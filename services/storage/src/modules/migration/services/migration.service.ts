import { Injectable } from "@nestjs/common";
import ORIGINMEDIA from "src/common/enums/media.enum";
import { readFile } from "src/common/functions/migration-image.function";
import { DatabaseService } from "src/database/services/database.service";
import { UploadService } from "src/modules/upload/services/upload.service";
import axios from "axios";
import { FileFormatChange } from "src/common/functions/file-format-change.function";

@Injectable()
export class MigrationService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly uploadService: UploadService
  ) {}

  async migrationImages(database: string) {
    await this.databaseService.initConnection(database);
    const collectionEmun = Object.values(ORIGINMEDIA);

    const promises: Promise<any>[] = [];

    for (let collection of collectionEmun) {
      let nameDirectory: string = this.getDirectory(collection);

      const itemCollection = this.databaseService.getCollection(collection);

      const documents = itemCollection
        .find({
          operationType: { $ne: "D" },
          picture: {
            $ne: "default.jpg",
            $not: { $regex: "http" },
          },
        })
        .limit(100);

      const arrayItem = await this.arrayPromiseDocument(
        documents,
        database,
        nameDirectory,
        itemCollection,
        collection
      );
      promises.concat(arrayItem);
    }

    await Promise.all(promises).then((values) => {
      //console.log('values',values);
    });
  }

  async migrationGoogleToAws(database: string) {
    console.log(database);
    await this.databaseService.initConnection(database);
    const collectionEnums = Object.values(ORIGINMEDIA);
    console.log(collectionEnums);

    for (let collection of collectionEnums) {
      const itemCollection = this.databaseService.getCollection(collection);
      const documentsCursor = itemCollection.find({
        picture: { $regex: /^https:\/\/storage\.googleapis\.com\// },
      });

      const documents = await documentsCursor.toArray();
      console.log(documents);
      console.log(collection)
      console.log("------documents-----");
      for (let i = 0; i < documents.length; i++) {
        try {
          console.log({ _id: documents[i]._id, picture: documents[i].picture });
          const url = documents[i].picture;
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data, "binary");
          const filename = url.substring(url.lastIndexOf("/") + 1);
          console.log("filename");
          console.log(filename);
          const mimetype = "image/jpeg";
          const file: Express.Multer.File = {
            fieldname: "file",
            originalname: filename,
            mimetype: mimetype,
            encoding: "binary",
            buffer: buffer,
            size: buffer.length,
            stream: null,
            destination: null,
            filename: null,
            path: null,
          };

          const uploadAws = await this.uploadService.save(
            database,
            collection,
            file,
            filename,
            process.env.S3_BUCKET
          );
          console.log(uploadAws);
          await itemCollection.updateOne(
            {
              _id: documents[i]._id,
            },
            {
              $set: {
                picture: uploadAws,
              },
            }
          );
          console.log("-------");
        } catch (e) {
          console.log("error al subir", e);
          console.log("-----------");
          continue;
        }
      }
    }
    await this.databaseService.closeConnection();
    return true;
  }

  private async arrayPromiseDocument(
    documents: any,
    database: string,
    nameDirectory: string,
    itemCollection: any,
    collection: string | ORIGINMEDIA | any
  ) {
    const promises: Promise<any>[] = [];
    for await (const document of documents) {
      const file = await readFile(database, nameDirectory, document.picture);
      if (file) {
        const newpromise = new Promise(async (resolve, reject) => {
          try {
            const url = await this.uploadService.save(
              database,
              collection,
              file as any,
              document.picture, //name

              process.env.GCP_BUCKET_MIGRATION as string
            );

            await itemCollection.updateOne(
              { _id: document._id },
              {
                $set: { picture: url },
              }
            );
            resolve(true);
          } catch (errr) {
            resolve(true);
          }
        });
        promises.push(newpromise);
      }
    }
    return promises;
  }
  private getDirectory(collection: string): string {
    let nameDirectory: string = "";

    switch (collection) {
      case "articles":
        nameDirectory = "article";
        break;
      case "categories":
        nameDirectory = "category";
        break;
      case "makes":
        nameDirectory = "make";
        break;
      case "configs":
        nameDirectory = "company";
        break;
      case "resources":
        nameDirectory = "resource";
        break;
      default:
        nameDirectory = collection;
    }
    return nameDirectory;
  }
}

// import { Storage } from '@google-cloud/storage';
import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import ORIGINMEDIA from "src/common/enums/media.enum";
import { FileFormatChange } from "src/common/functions/file-format-change.function";
import { S3Service } from "src/services/s3/services/s3.service";

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  async save(
    database: string,
    origin: ORIGINMEDIA,
    file: Express.Multer.File,
    name?: string | null,
    gcp_bucket: string = process.env.GCP_BUCKET_MIGRATION
  ): Promise<string> {
    try {
      if (!origin || !gcp_bucket || !file || !database) {
        throw new BadRequestException(`Want data(path, bucket, media)`);
      }
      this.validOrigin(origin);
      let originPath: string;

      const timestamp = Date.now().toString();
      // if (name) {
      originPath = this.cleanAndJoinElements([database, origin, timestamp]);
      // } else {
      // originPath = this.cleanAndJoinElements([database, origin]);
      // }
      // console.log(originPath);
      const uploadFile = FileFormatChange(file);

      const { url } = await this.s3Service.uploadFile(
        `${originPath}/`,
        uploadFile
      );

      return url;
    } catch (err) {
      throw err;
    }
  }

  async deleteFile(origin: string, bucket: string) {
    try {
      const pathParts = origin.split("/");
      const resource = pathParts.slice(3).join("/").replace(/%2F/g, "/");
      const decodedResource = decodeURIComponent(resource);
      const key = decodedResource.replace(/%25/g, "%");

      const response = await this.s3Service.deleteFile(key);

      return response ? true : false;
    } catch (err) {
      if (err.code == 404) {
        throw new BadRequestException({
          message: `Could not delete file, check url`,
          errors: err.errors,
        });
      }
      throw new BadRequestException(err);
    }
  }
  private validOrigin(origin: ORIGINMEDIA) {
    if (!Object.values(ORIGINMEDIA).includes(origin)) {
      throw new BadRequestException("invalid source path");
    }
  }

  cleanAndJoinElements(elements: string[]) {
    let cleanedElements = elements.map(function (element) {
      return element.replace(/\//g, "");
    });

    return cleanedElements.join("/");
  }
}

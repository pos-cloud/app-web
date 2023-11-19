import { Storage } from '@google-cloud/storage';
import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import ORIGINMEDIA from 'src/common/enums/media.enum';

@Injectable()
export class UploadService {
  private readonly storage: Storage;
  private GCP_PROJECT_ID: string;
  private GCP_KEY_FILE_PATH: string;

  constructor() {
    this.GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';
    this.GCP_KEY_FILE_PATH = process.env.GCP_KEY_FILE_PATH || '';
    this.storage = new Storage({
      projectId: this.GCP_PROJECT_ID,
      keyFilename: this.GCP_KEY_FILE_PATH,
    });
  }

  async save(
    database,
    origin: ORIGINMEDIA,
    contentType: string,
    media: Buffer,
    name: string,
    metadata: { [key: string]: string }[],
    gcp_bucket: string = process.env.GCP_BUCKET,
  ): Promise<string> {
    try {
      if (!origin || !gcp_bucket || !media || !database) {
        throw new BadRequestException(`Want data(path, bucket, media)`);
      }
      this.validOrigin(origin);

      name = Date.now() + '-' + name.replace(/ /g, '-');

      const originPath = [database, origin, name].join('/');

      const object = metadata.reduce(
        (obj, item) => Object.assign(obj, item),
        {},
      );
      const file = this.storage.bucket(gcp_bucket).file(originPath);

      const stream = file.createWriteStream();

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        stream.end(media);
      });

      await file.setMetadata({
        metadata: object,
      });

      const url = file.publicUrl();

      return url;
    } catch (err) {
      throw err;
    }
  }

  async deleteFile(
    origin: string,
    gcp_bucket: string = process.env.GCP_BUCKET,
  ) {
    try {
      // const urlParts = origin.split('?');
      const pathParts = origin.split('/');
      const resource = pathParts
        .slice(4, pathParts.length)
        .join('/')
        .replace(/%2F/g, '/');
      const deleteOptions = {};

      await this.storage
        .bucket(gcp_bucket)
        .file(resource)
        .delete(deleteOptions);
    } catch (err) {
      if (err.code == 404) {
        throw new BadRequestException({
          messge: `Could not delete file, check url`,
          errors: err.errors,
        });
      }
      throw new BadRequestException(err);
    }
  }
  private validOrigin(origin: ORIGINMEDIA) {
    if (!Object.values(ORIGINMEDIA).includes(origin)) {
      throw new BadRequestException('invalid source path');
    }
  }
}

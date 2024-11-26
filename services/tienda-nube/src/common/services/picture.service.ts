import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PictureService {
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async getValidPictureUrl(url: string): Promise<string | null> {
    if (!this.isValidUrl(url)) {
      return null;
    }

    try {
      const response = await axios.head(url, { timeout: 5000 });
      const contentType = response.headers['content-type'] || '';
      return contentType.startsWith('image/') ? url : null;
    } catch {
      return null;
    }
  }
}

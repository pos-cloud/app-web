import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PictureService {
  // Validar si el string es una URL válida
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Verificar si la URL apunta a una imagen que existe
  async getValidPictureUrl(url: string): Promise<string | null> {
    if (!this.isValidUrl(url)) {
      return null;
    }

    try {
      // Intentar con HEAD primero
      const response = await axios.head(url, { timeout: 5000 });
      const contentType = response.headers['content-type'] || '';
      if (contentType.startsWith('image/')) {
        return url;
      }
    } catch (error) {
      // Log para diagnóstico si falla HEAD
      console.error('HEAD request failed, attempting GET', error.message);
    }

    try {
      // Fallback: usar GET si HEAD falla
      const response = await axios.get(url, { timeout: 5000 });
      const contentType = response.headers['content-type'] || '';
      return contentType.startsWith('image/') ? url : null;
    } catch (error) {
      console.error('GET request failed', error.message);
      return null;
    }
  }
}

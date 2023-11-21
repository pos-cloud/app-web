const qrcode = require('qrcode')

export async function getQRCode(url: string) {
  try {
  
    const qrCode = await qrcode.toDataURL(url);

    return qrCode;
  } catch (error) {
    console.error('Error generando el código QR:', error);
    throw error;
  }
}





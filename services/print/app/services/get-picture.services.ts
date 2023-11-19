import axios from "axios";

export async function getCompanyPictureData(picture: string, token: string) {
    try {
        const URL = `${process.env.APIV1}get-image-base64-company`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token,
        };
        const params = {
            picture: picture,
        };

        const response = await axios.get(URL, { headers, params })
     return response.data.imageBase64
    } catch (error) {
      console.log(error)
    }

}

export function getCompanyPictureFromGoogle(picture: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      axios.get(picture, { responseType: 'arraybuffer' })
        .then(response => {
          const base64Image = Buffer.from(response.data, 'binary').toString('base64');
          resolve('data:image/jpeg;base64,' + base64Image);
        })
        .catch(error => {
          reject(error.response);
        });
    });
}
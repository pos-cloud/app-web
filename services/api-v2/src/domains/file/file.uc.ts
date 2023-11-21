import Axios from 'axios'
import * as fs from 'fs'
import config from './../../utils/config'

export default class FileUC {
  database: string
  authToken: string

  constructor(database: string, authToken?: string) {
    this.database = database
	this.authToken = authToken
  }

  deleteFile(type: string, model: string, filename: string) {
    try {
		const apiUrl = `${config.API_STORAGE}/upload`;

		const headers = {
		  'Content-Type': 'application/json',
		  'Authorization': this.authToken, // Asegúrate de que tengas el servicio de autenticación configurado
		};
	  
		const requestOptions = {
		  headers,
		  data: {
			origin: filename,
		  },
		};
	  
		Axios
		  .delete(apiUrl, requestOptions)
		  .then((response) => {
			console.log('Imagen eliminada correctamente:', response.data);
			return
		  })
		  .catch((error) => {
			console.error('Error al eliminar la imagen:', error);
			return
		  });
    } catch (err) {
      throw err
    }
  }
}

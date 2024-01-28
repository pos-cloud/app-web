import ArticleStockController from './article-stock.controller'

export default class ArticleStockUC {
  database: string
  articleStockController: ArticleStockController
  api: any
  authToken: string

  constructor(database: string) {
    this.database = database
    this.articleStockController = new ArticleStockController(database)
  }

  async updateFromExcel(data: any[]) {
    // Aquí procesas los datos del archivo Excel
    // data es un array de objetos donde cada objeto representa una fila del archivo Excel
    // Puedes iterar sobre data y realizar operaciones según tus necesidades
    for (const row of data) {
      // Ejemplo de cómo acceder a los datos de una fila:
      const codigo = row['article'];
      const cantidad = row['Cantidad'];

      console.log(codigo)
      // Realiza operaciones con los datos de la fila, como actualizar el stock, etc.
    }
  }


}

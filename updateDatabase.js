// update code to article stock
db['article-stocks'].aggregate([
  {
    $lookup: {
      from: 'articles',
      localField: 'article',
      foreignField: '_id',
      as: 'articleInfo',
    },
  },
  {
    $set: {
      code: { $arrayElemAt: ['$articleInfo.code', 0] },
    },
  },
  {
    $unset: 'articleInfo',
  },
  {
    $out: 'article-stocks',
  },
]);

// update variant
db.articles.find({ type: 'Final', operationType: { $ne: 'D' } }).forEach(function (article) {
  let variants = [];
  variants = db.variants
    .find({ articleParent: article._id, operationType: { $ne: 'D' } })
    .toArray()
    .map(function (variant) {
      return {
        type: variant.type,
        value: variant.value,
        articleId: variant.articleChild,
      };
    });

  if (variants.length > 0) {
    db.articles.updateOne({ _id: article._id }, { $set: { variants: variants } });
  }
});

// crear el stock
db['articles']
  .find({
    type: 'Final',
    $or: [
      {
        'article.variants': { $exists: false },
      },
      {
        'article.variants': { $size: 0 },
      },
    ],
  })
  .forEach(function (article) {
    db.getCollection('article-stocks').insertOne({
      article: article._id,
      deposit: ObjectId('66cf279d2d74e50027415a0d'),
      branch: ObjectId('66cf279d2d74e50027415a0b'),
      realStock: article.height,
      code: article.code,
      minStock: 0,
      maxStock: 0,
    });
  });

db['articles']
  .find({
    type: 'Variante',
  })
  .forEach(function (article) {
    db.getCollection('article-stocks').insertOne({
      article: article._id,
      deposit: ObjectId('66cf279d2d74e50027415a0d'),
      branch: ObjectId('66cf279d2d74e50027415a0b'),
      realStock: article.observation,
      code: article.code,
      variant: true,
      minStock: 0,
      maxStock: 0,
    });
  });

// update barcode laraherzig
db.articles.find({ type: 'Variante' }).forEach((article) => {
  let talle = '';
  let color = '';

  // Obtiene los documentos de variant-types y variant-values por ID
  const variantType1 = db['variant-types'].findOne({
    _id: article.variantType1,
  });
  const variantType2 = db['variant-types'].findOne({
    _id: article.variantType2,
  });
  const variantValue1 = db['variant-values'].findOne({
    _id: article.variantValue1,
  });
  const variantValue2 = db['variant-values'].findOne({
    _id: article.variantValue2,
  });

  // Verifica si los tipos son Talle y asigna el valor correspondiente
  if (variantType1 && variantType1.name === 'Talle') {
    talle = variantValue1 ? variantValue1.description : '';
  } else if (variantType2 && variantType2.name === 'Talle') {
    talle = variantValue2 ? variantValue2.description : '';
  }

  // Verifica si los tipos son Color o Tela y asigna el valor correspondiente
  if (variantType1 && (variantType1.name === 'Color' || variantType1.name === 'Tela')) {
    color = variantValue1 ? variantValue1.description : '';
  } else if (variantType2 && (variantType2.name === 'Color' || variantType2.name === 'Tela')) {
    color = variantValue2 ? variantValue2.description : '';
  }

  // Elimina paréntesis y barras de `color` y genera el código con iniciales en mayúsculas
  const sanitizedColor = color.replace(/[()\/]/g, '').trim(); // Elimina "(", ")", y "/"
  const colorCode = sanitizedColor
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  // Genera el barcode pegado: code + talle + colorCode
  const barcode = article.code + talle + colorCode;

  // Actualiza el documento de `articles` con el nuevo `barcode`
  db.articles.updateOne({ _id: article._id }, { $set: { barcode: barcode } });
});

// ultimos codigo de barra
db.articles.find({ type: 'Variante' }).forEach(function (article) {
  const code = Number(article.code);

  if (code >= 401) {
    // Reemplazar las barras '/' por espacios
    const correctedDescription = article.description
      .replace(/\//g, ' ') // Reemplazar '/' por espacio
      .replace(/\bY\b/g, ' '); // Reemplazar 'Y' (como palabra independiente) por espacio

    // Dividir la descripción en palabras
    const descriptionWords = correctedDescription.split(' ');

    // Obtener la última palabra completa
    const lastWord = descriptionWords.pop(); // Extrae y guarda la última palabra

    // Obtener las primeras letras de las palabras anteriores a la última palabra
    const firstLetters = descriptionWords
      .map((word) => word.charAt(0)) // Tomamos la primera letra de cada palabra
      .join(''); // Unir las primeras letras

    // Ahora, eliminamos la última letra de `firstLetters`
    //const firstLettersWithoutLast = firstLetters.slice(0, -1); // Elimina la última letra

    // Crear el código de barras
    const barcode = article.code + firstLetters + lastWord;

    // Actualizar el documento con el nuevo código de barras
    db.articles.updateOne(
      { _id: article._id }, // Usamos _id para identificar el artículo
      { $set: { barcode: barcode } }
    );
  }
});

// replace colddown for interval
db.galleries.updateMany(
  { colddown: { $exists: true } }, // Filtrar documentos con `colddown`
  [
    {
      $set: { interval: '$colddown' }, // Copiar el valor de `colddown` a `interval`
    },
  ]
);

// para poner en 0 los balance menores a 10
db.transactions.updateMany(
  { balance: { $lt: 10 } }, // Filtro: balance menor a 10
  { $set: { balance: 0 } } // Actualización: balance a 0
);

// image article for localhost
db.articles.find({}).forEach((article) => {
  const newPictureUrl = 'https://poscloud.s3.sa-east-1.amazonaws.com/granpaso/' + article.picture;
  db.articles.updateOne({ _id: article._id }, { $set: { picture: newPictureUrl } });
});

db.categories.find({}).forEach((category) => {
  const newPictureUrl = 'https://poscloud.s3.sa-east-1.amazonaws.com/granpaso/' + category.picture;
  db.categories.updateOne({ _id: category._id }, { $set: { picture: newPictureUrl } });
});

//update category
db['movements-of-articles'].find({}).forEach((movement) => {
  const article = db.articles.findOne({ _id: movement.article });

  if (article && article.category && movement.category && article.category !== movement.category) {
    // Si article.category y movement.category existen y son diferentes, actualiza el movimiento
    db['movements-of-articles'].updateOne({ _id: movement._id }, { $set: { category: article.category } });
  }
});

// creacion de stock para articulos sin stock
db.articles
  .find({ type: 'Final', containsVariants: false, $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }] })
  .forEach(function (article) {
    const exists = db['article-stocks'].findOne({ article: article._id });

    if (!exists) {
      db['article-stocks'].insertOne({
        realStock: 0,
        minStock: 0,
        maxStock: 0,
        audits: [],
        code: article.code,
        article: article._id,
        branch: ObjectId('66d1b6d32d74e50027417ef2'),
        deposit: ObjectId('66d1b6d32d74e50027417ef4'),
        creationDate: ISODate('2024-09-11T17:13:25.000Z'),
        operationType: 'C',
      });
    }
  });

db.articles.find({ type: 'Variante' }).forEach(function (article) {
  const exists = db['article-stocks'].findOne({ article: article._id });

  if (!exists) {
    db['article-stocks'].insertOne({
      realStock: 0,
      minStock: 0,
      maxStock: 0,
      audits: [],
      code: article.code,
      article: article._id,
      branch: ObjectId('66d1b6d32d74e50027417ef2'),
      deposit: ObjectId('66d1b6d32d74e50027417ef4'),
      creationDate: ISODate('2024-09-11T17:13:25.000Z'),
      operationType: 'C',
    });
  }
});

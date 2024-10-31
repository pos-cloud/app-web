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
db.articles
  .find({ type: 'Final', operationType: { $ne: 'D' } })
  .forEach(function (article) {
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
      db.articles.updateOne(
        { _id: article._id },
        { $set: { variants: variants } }
      );
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
  if (
    variantType1 &&
    (variantType1.name === 'Color' || variantType1.name === 'Tela')
  ) {
    color = variantValue1 ? variantValue1.description : '';
  } else if (
    variantType2 &&
    (variantType2.name === 'Color' || variantType2.name === 'Tela')
  ) {
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
db.articles
  .find({ type: 'Variante', operationType: { $ne: 'D' } })
  .forEach(function (article) {
    let variants = [];
    variants = db.variants
      .find({ articleChild: article._id, operationType: { $ne: 'D' } })
      .toArray()
      .map(function (variant) {
        return {
          type: variant?.type,
          value: variant?.value,
        };
      });
    db.articles.updateOne(
      { _id: article._id },
      {
        $set: {
          valueVariant: variants?.[0]?.value ?? null,
          typeVariant: variants?.[0]?.type ?? null,
          variantType1: variants?.[0]?.type ?? null,
          variantValue1: variants?.[0]?.value ?? null,
          variantType2: variants?.[1]?.type ?? null,
          variantValue2: variants?.[1]?.value ?? null,
        },
      }
    );
  });

//blanco
db.article.updateOne(
  { _id: new ObjectId('') },
  {
    $set: {
      valueVariant: '65fb49bc4f765100286d8940',
      typeVariant: '65fb491af7473400277a2fcb',
      variantType1: '65fb491af7473400277a2fcb',
      variantValue1: '65fb49bc4f765100286d8940',
    },
  }
);

//Ocre
db.article.updateOne(
  { _id: new ObjectId('') },
  {
    $set: {
      valueVariant: '65fb49bc4f765100286d8940',
      typeVariant: '65fb491af7473400277a2fcb',
      variantType1: '65fb491af7473400277a2fcb',
      variantValue1: '65fb49bc4f765100286d8940',
    },
  }
);

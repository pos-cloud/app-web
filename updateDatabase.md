// update code to article stock
db['article-stocks'].aggregate([
  {
    $lookup: {
      from: "articles",
      localField: "article",
      foreignField: "_id",
      as: "articleInfo"
    }
  },
  {
    $set: {
      code: { $arrayElemAt: ["$articleInfo.code", 0] }
    }
  },
  {
    $unset: "articleInfo"
  },
  {
    $out: "article-stocks"
  }
])


// update variant
db.articles.find({ type: "Final", operationType: { $ne: "D" } }).forEach(function(article) {
    let variants = [];
    
    variants = db.variants.find({ articleParent: article._id }).toArray().map(function(variant) {
        return {
            type: variant.type,
            value: variant.value,
            articleId: variant.articleChild
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
db.articles.find({
  type: "Final",
  $or: [
    { "article.variants": { $exists: false } },
    { "article.variants": { $size: 0 } }
  ]
}).forEach(function(article) {
  db.getCollection('article-stocks').insertOne({
    article: article._id,
    deposit: ObjectId('66cf279d2d74e50027415a0d'),
    branch: ObjectId('66cf279d2d74e50027415a0b'),
    realStock: article.height, 
    code: article.code,
    minStock: 0,
    maxStock: 0
  });
});

db.articles.find({
  type: "Variante"
}).forEach(function(article) {
  db.getCollection('article-stocks').insertOne({
    article: article._id,
    deposit: ObjectId('66cf279d2d74e50027415a0d'),
    branch: ObjectId('66cf279d2d74e50027415a0b'),
    realStock: article.observation, 
    code: article.code,
    variant: true,
    minStock: 0,
    maxStock: 0
  });
});
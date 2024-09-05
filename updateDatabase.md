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
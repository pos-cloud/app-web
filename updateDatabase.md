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

import axios from "axios";
import Article from "../models/article";
import { ObjectId } from "mongodb";

export async function getArticleData(articleId: string, token: string): Promise<Article> {
  try {
    const URL = `${process.env.APIV1}article`;
    const headers = {
      'Authorization': token,
    };

    const params = {
      id: articleId
    }
    const data = await axios.get(URL, { headers, params });
    const responses: Article = data.data.article
  
    return responses;
  } catch (error) {
    console.log(error)
  }
}

export async function getArticlesData( token: string, articlesIds: string[]): Promise<Article[]> {
  try {

    let articlesArray: { $oid: string }[] = [];
    articlesIds.forEach((articleId: string) => {
      articlesArray.push({$oid: articleId});
    });

    let project = {
      salePrice: 1,
      description: 1,
      'make.description': 1
    }
    let sort = {}
    let group = {}
    let limit = 0
    let skip = 0
    let match = {
      _id : { $in : articlesArray }
    }

    const URL = `${process.env.APIV2}articles`;
    const headers = {
      'Authorization': token,
    };

    const params = {
      match: JSON.stringify(match),
      project: JSON.stringify(project),
      sort: JSON.stringify(sort),
      group: JSON.stringify(group),
      limit: limit.toString(),
      skip: skip.toString()
    }
    const data = await axios.get(URL, { headers, params });
    const responses: Article[] = data.data.result
    return responses;
  } catch (error) {
    console.log(error)
  }
}
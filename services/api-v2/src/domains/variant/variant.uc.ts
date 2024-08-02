import axios from "axios"
import VariantController from "./variant.controller"
import Variant from "./variant.interface"
import ArticleController from "../article/article.controller"
import Controller from "../model/model.controller"
import ObjDto from '../article/article.dto'
import ObjSchema from '../article/article.model'
import VariantSchema from '../variant/variant.model'

export default class VariantUC extends Controller {
    database: string
    articleController: VariantController
    api: any
    authToken: string

    constructor(database: string, authToken?: string) {
        super(ObjSchema, ObjDto, database)
        this.database = database
        this.authToken = authToken
        this.articleController = new VariantController(database)
        this.api = axios.defaults
    }

    createVariant = async (articleParentId: string, variants: Variant[]) => {
        try {
            const articleController = new ArticleController(this.database);
            const articleResponse = await articleController.getById(articleParentId);

            if (!articleResponse.result) {
                throw new Error(`No se encontró el artículo padre con ID ${articleParentId}`);
            }

            const article = articleResponse.result;

            // Organizar las variantes por tipo
            let variantForType = variants.reduce((acc: any, variant: Variant) => {
                if (!acc[variant.type.name]) {
                    acc[variant.type.name] = [];
                }
                acc[variant.type.name].push(variant.value.description);
                return acc;
            }, {});

            // Obtener los tipos de variantes y sus valores
            let types = Object.keys(variantForType).sort();
            let valuesForType = types.map(type => variantForType[type]);

            // Obtener todas las combinaciones de valores
            let combinations: string[][] = [[]];

            types.forEach((type, index) => {
                let newResults: string[][] = [];
                combinations.forEach((combination) => {
                    valuesForType[index].forEach((value: any) => {
                        newResults.push([...combination, value]);
                    });
                });
                combinations = newResults;
            });

            // Crear los artículos hijos y almacenarlos
            let results: any[] = [];

            combinations.forEach((combination: string[]) => {
                let child: any = { ...article._doc, type: 'Variante', description: `${article.description} ${combination.join(' / ')}` };

                results.push(articleController.save(new this.model(child)));
            });
            Promise.all(results).then(async (result) => {
                if (result.length) {
                    for (let [index, articleChild] of result.entries()) {
                        let newVariant: Variant = VariantSchema.getInstance(this.database);
                        newVariant = Object.assign(newVariant, {
                            type: variants[index]?.type._id,
                            value: variants[index]?.value._id,
                            articleParent: articleParentId,
                            articleChild: articleChild.result._id,
                        });
                        const resultVariant = await new VariantController(this.database).save(newVariant);
                        if(!resultVariant.result && resultVariant.status !== 200){
                            throw new Error("No se crearon las variantes correctamente");
                        }
                    }
                }
            })

        } catch (error) {
            console.error('Error al crear variantes:', error);
            throw error;
        }
    }

}

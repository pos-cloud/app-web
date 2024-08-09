import axios from "axios"
import VariantController from "./variant.controller"
import Variant from "./variant.interface"
import ArticleController from "../article/article.controller"
import Controller from "../model/model.controller"
import ObjDto from '../article/article.dto'
import ObjSchema from '../article/article.model'
import VariantSchema from '../variant/variant.model'
import VariantTypeController from "../variant-type/variant-type.controller"
import VariantValueController from "../variant-value/variant-value.controller"
import { ObjectId } from "bson"
import { match } from "assert"

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
    
            // Organizar las variantes por tipo (por ejemplo, color, sexo, talle)
            let variantForType = variants.reduce((acc: any, variant: Variant) => {
                if (!acc[variant.type.name]) {
                    acc[variant.type.name] = [];
                }
                acc[variant.type.name].push(variant.value.description);
                return acc;
            }, {});
    
            // Obtener los tipos de variantes y sus valores
            let types = Object.keys(variantForType).sort();  // Ordena los tipos para mantener la consistencia
            let valuesForType = types.map(type => variantForType[type]);
    
            // Obtener todas las combinaciones de valores de las variantes
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
    
            // Crear los artículos hijos con sus respectivas combinaciones de variantes
            let results: any[] = [];
    
            for (const combination of combinations) {
                let child: any = {
                    ...article._doc,
                    type: 'Variante',
                    description: `${article.description} ${combination.join(' / ')}`
                };
    
                // Guardar el artículo hijo y obtener el resultado
                const savedArticleChild = await articleController.save(new this.model(child));
    
                if (!savedArticleChild.result) {
                    throw new Error("No se pudo guardar el artículo hijo");
                }
    
                // Crear y guardar las variantes para este artículo hijo
                for (let j = 0; j < types.length; j++) {
                    const type = types[j];
                    const value = combination[j];
    
                    const matchingVariant = variants.find(variant => 
                        variant.type.name === type && variant.value.description === value
                    );
    
                    if (matchingVariant) {
                        let newVariant: Variant = VariantSchema.getInstance(this.database);
                        newVariant = Object.assign(newVariant, {
                            type: matchingVariant.type._id,
                            value: matchingVariant.value._id,
                            articleParent: articleParentId,
                            articleChild: savedArticleChild.result._id,
                        });
    
                        const resultVariant = await new VariantController(this.database).save(newVariant);
    
                        if (!resultVariant.result && resultVariant.status !== 200) {
                            throw new Error("No se crearon las variantes correctamente");
                        }
                    }
                }
    
                results.push(savedArticleChild);
            }
    
            return results;
    
        } catch (error) {
            console.error('Error al crear variantes:', error);
            throw error;
        }
    };
    
    updateVariant = async (articleParentId: string, variants: Variant[]) => {
        try {
            const articleController = new ArticleController(this.database);
            const variantController = new VariantController(this.database);
            const variantTypeController = new VariantTypeController(this.database);
            const variantValueController = new VariantValueController(this.database);

            if (!variants.length) {
                let variant = await variantController.find({ articleParent: articleParentId }, {})

                const articleChildIds = variant.map((variant: any) => ({ $oid: variant.articleChild }));

                await articleController.deleteMany({ _id: { $in: articleChildIds } })
                await variantController.deleteMany({})
                return
            }

            // Obtener el artículo padre
            const articleResponse = await articleController.getById(articleParentId);
            if (!articleResponse.result) {
                throw new Error(`No se encontró el artículo padre con ID ${articleParentId}`);
            }
            const article = articleResponse.result;

            // Obtener detalles completos de los tipos y valores si solo se pasan los IDs
            const completeVariants = await this.getAllVariants(variants, variantTypeController, variantValueController);

            // Organizar las variantes por tipo
            const variantForType = this.organizeVariantsByType(completeVariants);

            // Generar todas las combinaciones posibles de variantes
            const combinations = this.generateCombinations(variantForType);

            // Obtener los artículos hijos existentes
            const existingChildren = await this.getExistingChildren(articleParentId, articleController, variantController);

            // Crear o actualizar artículos hijos basados en las combinaciones
            const results = await this.createOrUpdateChildren(combinations, article, completeVariants, articleParentId, articleController, variantController, existingChildren);

            // Eliminar artículos hijos que no están en las nuevas combinaciones
            await this.deleteInvalidChildren(combinations, existingChildren, article, articleController);
            await Promise.all(results);

            return results;
        } catch (error) {
            console.error('Error al actualizar variantes:', error);
            throw error;
        }
    }

    getAllVariants = async (variants: any, variantTypeController: any, variantValueController: any) => {
        return await Promise.all(variants.map(async (variant: any) => {
            if (typeof variant.type === 'string' || typeof variant.value === 'string') {
                const typeResponse = await variantTypeController.getById(variant.type);
                const valueResponse = await variantValueController.getById(variant.value);
                return {
                    type: typeResponse.result,
                    value: valueResponse.result
                };
            } else {
                return variant;
            }
        }));
    }

    organizeVariantsByType = (completeVariants: any) => {
        return completeVariants.reduce((acc: any, variant: any) => {
            if (!acc[variant.type.name]) {
                acc[variant.type.name] = [];
            }
            acc[variant.type.name].push(variant.value.description);
            return acc;
        }, {});
    }

    generateCombinations = (variantForType: any) => {
        const types = Object.keys(variantForType).sort();
        const valuesForType = types.map(type => variantForType[type]);

        let combinations: any[] = [[]];
        types.forEach((type, index) => {
            let newResults: any = [];
            combinations.forEach((combination: any) => {
                valuesForType[index].forEach((value: any) => {
                    newResults.push([...combination, value]);
                });
            });
            combinations = newResults;
        });
        return combinations;
    }

    getExistingChildren = async (articleParentId: any, articleController: any, variantController: any) => {
        try {
            const existingVariantsResponse = await variantController.getAll({
                project: { articleParent: 1, articleChild: 1 },
                match: {
                    $or: [
                        { articleParent: { $oid: articleParentId } },
                        { articleChild: { $oid: articleParentId } }
                    ]
                }
            });

            const existingVariants = existingVariantsResponse.result;
            const existingChildIds = existingVariants.map((variant: any) => ({ $oid: variant.articleChild }));

            const existingChildrenResponse = await articleController.getAll({
                project: {
                    _id: 1,
                    description: 1,
                    salePrice: 1,
                    costPrice: 1,
                    type: 1
                },
                match: {
                    _id: { $in: existingChildIds }
                }
            });
            return existingChildrenResponse.result;
        } catch (error) {
            throw error;
        }
    }
    
    createOrUpdateChildren = async (combinations: any, article: any, completeVariants: any, articleParentId: any, articleController: any, variantController: any, existingChildren: any) => {
        try {
            let results = [];
            for (const combination of combinations) {
                let description: string;
                let existingChild;
    
                if (article.type === 'Variante') {
                    description = article.description;
                    existingChild = existingChildren.find((child: any) => child.description === article.description);
                } else {
                    description = `${article.description} ${combination.join(' / ')}`;
                    existingChild = existingChildren.find((child: any) => child.description === description);
                }
    
                if (existingChild) {
                    // Si existe el artículo hijo, actualizar su descripción y tipo si es necesario
                    if (existingChild.description !== description || existingChild.type !== 'Variante') {
                        let updatedChild = { description: description, type: 'Variante' };
                        results.push(await articleController.update(existingChild._id, updatedChild));
                    }
                } else {
                    // Crear un nuevo artículo hijo
                    let child = { ...article._doc, description: description, type: 'Variante' };
                    delete child._id;
                    let newArticle = await articleController.save(new articleController.model(child));
    
                    // Crear y asociar las variantes correspondientes con el nuevo artículo hijo
                    for (let j = 0; j < combination.length; j++) {
                        const variantValue = combination[j]; // Obtener el valor correspondiente en la combinación
    
                        // Filtrar variantes que coincidan con el valor actual de la combinación
                        const matchingVariants = completeVariants.filter((v: any) => 
                            v.value.description === variantValue
                        );
    
                        // Crear variantes para el artículo hijo
                        for (const matchingVariant of matchingVariants) {
                            let newVariant = {
                                type: matchingVariant.type._id,
                                value: matchingVariant.value._id,
                                articleParent: articleParentId,
                                articleChild: newArticle.result._id
                            };
    
                            const savedVariant = await variantController.save(new variantController.model(newVariant));
                            if (!savedVariant.result && savedVariant.status !== 200) {
                                throw new Error("No se crearon las variantes correctamente");
                            }
                        }
                    }
    
                    results.push(newArticle);
                }
            }
            return results;
        } catch (error) {
            throw error;
        }
    };
    

    deleteInvalidChildren = async (combinations: any, existingChildren: any, article: any, articleController: any) => {
        try {
            for (const child of existingChildren) {
               
               let existingCombinations;
                if (article.type === 'Variante') {
                    existingCombinations =  child.description !== article.description
                } else {
                    existingCombinations = !combinations.some((combination: any) => child.description === `${article.description} ${combination.join(' / ')}`)
                }
              
                if (existingCombinations) {
                    const variants = await new VariantController(this.database).getAll({
                        project: {
                            articleChild: 1,
                            _id: 1
                        },
                        match: {
                            articleChild: { $oid: child._id }
                        }
                    })
                    await new VariantController(this.database).delete(variants.result[0]._id)
                    await articleController.delete(child._id);
                }
            }
        } catch (error) {
            throw new Error(`Error al elimina el producto`);
        }
    }
}

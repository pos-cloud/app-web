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
import Article from "../article/article.interface"
import ApplicationController from "../application/application.controller"
import Application, { ApplicationType } from "../application/application.interface"
import config from "../../utils/config"

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

    createVariant = async (articleParentId: string, variants: any[]) => {
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

            for (const [index, combination] of combinations.entries()) {
                let child: any = {
                    ...article._doc,
                    type: 'Variante',
                    description: `${article.description} ${combination.join(' / ')}`,
                    taxes: variants[index].taxes ?? article._doc.taxes,
                    costPrice: variants[index].costPrice ?? article._doc.costPrice,
                    markupPercentage: variants[index].markupPercentage ?? article._doc.markupPercentage,
                    markupPrice: variants[index].markupPrice ?? article._doc.markupPrice,
                    salePrice: variants[index].salePrice ?? article._doc.salePrice,
                    basePrice: variants[index].basePrice ?? article._doc.basePrice,
                    weight: variants[index].weight ?? article._doc.weight,
                    width: variants[index].width ?? article._doc.width,
                    height: variants[index].height ?? article._doc.height,
                    depth: variants[index].depth ?? article._doc.depth,
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

    updateVariant = async (articleParentId: string, variants: any[], articleOld: Article, token: string) => {
        try {
            const articleController = new ArticleController(this.database);
            const variantController = new VariantController(this.database);
            const variantTypeController = new VariantTypeController(this.database);
            const variantValueController = new VariantValueController(this.database);
            const application: Application[] = await new ApplicationController(this.database).find({ type: ApplicationType.TiendaNube }, {})
            this.authToken = token

            const articleResponse = await articleController.getById(articleParentId);
            if (!articleResponse.result) {
                throw new Error(`No se encontró el artículo padre con ID ${articleParentId}`);
            }
            const article = articleResponse.result.toObject();
            if (!variants.length) {
                let variant = await variantController.find({ articleParent: articleParentId }, {})

                const articleChildIds = variant.map((variant: Variant) => ({ $oid: variant.articleChild }));
                let articleChild = await articleController.getAll({
                    project: {
                        _id: 1,
                        tiendaNubeId: 1
                    },
                    match: {
                        _id: { $in: articleChildIds }
                    }
                })
                for (let child of articleChild.result) {
                    if (application.length && application[0].tiendaNube.token && application[0].tiendaNube.userId && article.tiendaNubeId && child.tiendaNubeId) {
                        await axios.delete(`${config.TIENDANUBE_URL}/products/variant`, {
                            headers: {
                                Authorization: this.authToken
                            },
                            data: {
                                productTn: article.tiendaNubeId,
                                variantTn: child.tiendaNubeId
                            }
                        })
                    }
                }
                await articleController.deleteMany({ _id: { $in: articleChildIds } })
                await variantController.deleteMany({ articleParent: { $oid: articleParentId } })
                return
            }

            // Obtener detalles completos de los tipos y valores si solo se pasan los IDs
            const completeVariants = await this.getAllVariants(variants, variantTypeController, variantValueController);

            // Organizar las variantes por tipo<
            const variantForType = this.organizeVariantsByType(completeVariants);

            // Generar todas las combinaciones posibles de variantes
            const combinations = this.generateCombinations(variantForType);

            // Obtener los artículos hijos existentes
            const existingChildren = await this.getExistingChildren(articleParentId, articleController, variantController);

            // Crear o actualizar artículos hijos basados en las combinaciones
            const results = await this.createOrUpdateChildren(combinations, article, completeVariants, articleParentId, articleController, variantController, existingChildren, articleOld);

            // Eliminar artículos hijos que no están en las nuevas combinaciones
            await this.deleteInvalidChildren(combinations, existingChildren, article, articleController, articleOld, application);
            await Promise.all(results);

            return results;
        } catch (error) {
            console.error('Error al actualizar variantes:', error);
            throw error;
        }
    }

    getAllVariants = async (variants: Variant[], variantTypeController: any, variantValueController: any) => {
        return await Promise.all(variants.map(async (variant: any) => {
            if (typeof variant.type === 'string' || typeof variant.value === 'string') {
                const typeResponse = await variantTypeController.getById(variant.type);
                const valueResponse = await variantValueController.getById(variant.value);
                return {
                    type: typeResponse.result,
                    value: valueResponse.result,
                    basePrice: variant.basePrice,
                    taxes: variant.taxes,
                    costPrice: variant.costPrice,
                    markupPercentage: variant.markupPercentage,
                    markupPrice: variant.markupPrice,
                    salePrice: variant.salePrice,
                    weight: variant.weight,
                    width: variant.width,
                    height: variant.height,
                    depth: variant.depth,
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

    getExistingChildren = async (articleParentId: string, articleController: any, variantController: any) => {
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
                    type: 1,
                    picture: 1,
                    pictures: 1,
                    tiendaNubeId: 1,
                    basePrice: 1,
                    taxes: 1,
                    salePrice: 1,
                    costPrice: 1,
                    markupPercentage: 1,
                    markupPrice: 1,
                    weight: 1,
                    width: 1,
                    height: 1,
                    depth: 1
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

    createOrUpdateChildren = async (combinations: any, article: Article, completeVariants: any, articleParentId: string, articleController: any, variantController: any, existingChildren: any, articleOld: Article) => {
        try {
            let results = [];
            let updatedChildrens = [];
            // Actualizar las descripciones de los artículos hijos si la descripción del artículo padre cambió
            if (article.description !== articleOld.description) {
                for (let articleChild of existingChildren) {
                    let newDescription = articleChild.description.replace(articleOld.description, article.description);
                    let { result } = await articleController.update(articleChild._id, { description: newDescription });
                    updatedChildrens.push(result);
                }
            } else {
                updatedChildrens = existingChildren
            }
            for (const [index, combination] of combinations.entries()) {
                let description: string;
                let existingChild;

                if (article.type === 'Variante') {
                    description = article.description;
                    existingChild = updatedChildrens.find((child: any) => child.description === article.description);
                } else {
                    description = `${article.description} ${combination.join(' / ')}`;
                    existingChild = updatedChildrens.find((child: any) => child.description === description);
                }
                if (existingChild) {
                    if (article.updateVariants) {
                        let updatedChild = {
                            ...article,
                            description: description,
                            type: 'Variante',
                            picture: existingChild.picture,
                            pictures: existingChild.pictures,
                            tiendaNubeId: existingChild.tiendaNubeId,
                            basePrice: completeVariants[index].basePrice ?? article.basePrice,
                            taxes: completeVariants[index].taxes ?? article.taxes,
                            costPrice: completeVariants[index].costPrice ?? article.costPrice,
                            markupPercentage: completeVariants[index].markupPercentage ?? article.markupPercentage,
                            markupPrice: completeVariants[index].markupPrice ?? article.markupPrice,
                            salePrice: completeVariants[index].salePrice ?? article.salePrice,
                            weight: completeVariants[index].weight ?? article.weight,
                            width: completeVariants[index].width ?? article.width,
                            height: completeVariants[index].height ?? article.height,
                            depth: completeVariants[index].depth ?? article.depth

                        };
                        results.push(await articleController.update(existingChild._id, updatedChild));
                    } else {
                        let updatedChild = { description: description, type: 'Variante' };
                        results.push(await articleController.update(existingChild._id, updatedChild));
                    }
                } else {

                    // Crear un nuevo artículo hijo
                    let child = { ...article, description: description, type: 'Variante' };
                    delete child._id;
                    delete child.tiendaNubeId
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

    deleteInvalidChildren = async (combinations: any, existingChildren: any, article: Article, articleController: any, articleOld: Article, applications: Application[]) => {
        try {
            let updatedChildrens = []
            if (article.description !== articleOld.description) {
                for (let articleChild of existingChildren) {
                    let { result } = await new ArticleController(this.database).getById(articleChild._id)
                    updatedChildrens.push(result);
                }
            } else {
                updatedChildrens = existingChildren
            }

            for (const child of updatedChildrens) {

                let existingCombinations;
                if (article.type === 'Variante') {
                    existingCombinations = child.description !== article.description
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
                    for (let variant of variants.result) {
                        if (applications.length && applications[0].tiendaNube.token && applications[0].tiendaNube.userId && article.tiendaNubeId && child.tiendaNubeId) {
                            await axios.delete(`${config.TIENDANUBE_URL}/products/variant`, {
                                headers: {
                                    Authorization: this.authToken
                                },
                                data: {
                                    productTn: article.tiendaNubeId,
                                    variantTn: child.tiendaNubeId
                                }
                            })
                        }
                        await new VariantController(this.database).delete(variant._id)
                        await articleController.delete(child._id);
                    }
                }
            }
        } catch (error) {
            console.log(error)
            throw new Error(`Error al elimina el producto`);
        }
    }

    createVariantExel = async (articleParentId: string, variants: any) => {
        const articleController = new ArticleController(this.database);
        const articleResponse = await articleController.getById(articleParentId);

        if (!articleResponse.result) {
            throw new Error(`No se encontró el artículo padre con ID ${articleParentId}`);
        }

        const article = articleResponse.result;

        // Crear un objeto para almacenar los valores de cada tipo
        const typeValues: any = {};

        // Recopilar los valores de los tipos presentes en las variantes
        variants.forEach((variant: any) => {
            for (const key in variant) {
                if (key.startsWith('type')) {
                    const typeName = variant[key].name;
                    if (!typeValues[typeName]) {
                        typeValues[typeName] = [];
                    }
                }
            }
            for (const key in variant) {
                if (key.startsWith('value')) {
                    const typeIndex = key.charAt(5); // Extraer el número del tipo
                    const typeName = variant[`type${typeIndex}`].name;
                    if (typeValues[typeName]) {
                        typeValues[typeName].push(variant[key].description);
                    }
                }
            }
        });

        // Crear un conjunto para almacenar combinaciones únicas
        const uniqueCombinations = new Map<string, any>();

        // Crear combinaciones basadas en las variantes presentes
        variants.forEach((variant: any) => {
            const description = [
                variant.value1 ? variant.value1.description : '',
                variant.value2 ? variant.value2.description : '',
                variant.value3 ? variant.value3.description : ''
            ].filter(desc => desc).join(' / ');

            const combinationKey = `${article.description} ${description}`;

            // Almacenar todas las propiedades de la variante en el Map
            if (!uniqueCombinations.has(combinationKey)) {
                uniqueCombinations.set(combinationKey, {
                    ...variant,
                    description: combinationKey
                });
            }
        });

        // Convertir el Map en un array y ordenarlo
        const resultArray = Array.from(uniqueCombinations.values()).sort((a, b) => a.description.localeCompare(b.description));
        for (const combination of resultArray) {

            const child = {
                ...article._doc,
                type: 'Variante',
                description: combination.description,
                taxes: combination.taxes ?? article._doc.taxes,
                costPrice: combination.costPrice ?? article._doc.costPrice,
                markupPercentage: combination.markupPercentage ?? article._doc.markupPercentage,
                markupPrice: combination.markupPrice ?? article._doc.markupPrice,
                salePrice: combination.salePrice ?? article._doc.salePrice,
                basePrice: combination.basePrice ?? article._doc.basePrice,
                weight: combination.weight ?? article._doc.weight,
                width: combination.width ?? article._doc.width,
                height: combination.height ?? article._doc.height,
                depth: combination.depth ?? article._doc.depth,
            };

            const savedArticleChild = await articleController.save(new this.model(child));

            if (!savedArticleChild.result) {
                throw new Error("No se pudo guardar el artículo hijo");
            }

            if (combination.type1 && combination.value1) {
                let newVariant: Variant = VariantSchema.getInstance(this.database);
                newVariant = Object.assign(newVariant, {
                    type: combination.type1._id,
                    value: combination.value1._id,
                    articleParent: articleParentId,
                    articleChild: savedArticleChild.result._id,
                });

                const resultVariant = await new VariantController(this.database).save(newVariant);

                if (!resultVariant.result) {
                    throw new Error("No se crearon las variantes correctamente");
                }
            }
            if (combination.type2 && combination.value2) {
                let newVariant: Variant = VariantSchema.getInstance(this.database);
                newVariant = Object.assign(newVariant, {
                    type: combination.type2._id,
                    value: combination.value2._id,
                    articleParent: articleParentId,
                    articleChild: savedArticleChild.result._id,
                });

                const resultVariant = await new VariantController(this.database).save(newVariant);

                if (!resultVariant.result) {
                    throw new Error("No se crearon las variantes correctamente");
                }

            }
            if (combination.type3 && combination.value3) {
                let newVariant: Variant = VariantSchema.getInstance(this.database);
                newVariant = Object.assign(newVariant, {
                    type: combination.type3._id,
                    value: combination.value3._id,
                    articleParent: articleParentId,
                    articleChild: savedArticleChild.result._id,
                });

                const resultVariant = await new VariantController(this.database).save(newVariant);

                if (!resultVariant.result) {
                    throw new Error("No se crearon las variantes correctamente");
                }

            }
        }
        return resultArray;
    }
}

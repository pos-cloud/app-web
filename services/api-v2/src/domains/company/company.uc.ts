import * as axios from 'axios'
import CompanyController from './company.controller'
import Company from './company.interface'
import CompanySchema from './company.model'
import VATConditionController from '../vat-condition/vat-condition.controller'
import IdentificationTypeController from '../identification-type/identification-type.controller'
import VATCondition from '../vat-condition/vat-condition.interface'
import IdentificationType from '../identification-type/identification-type.interface'
import Responser from '../../utils/responser'
import moment = require('moment')
import Country from '../country/country.interface'
import CountryController from '../country/country.controller'
import State from '../state/state.interface'
import StateController from '../state/state.controller'

export default class CompanyUc {
    database: string
    companyController: CompanyController
    api: any
    authToken: string

    constructor(database: string, authToken?: string) {
        this.database = database
        this.authToken = authToken
        this.companyController = new CompanyController(database)
        this.api = axios.default
    }

    async importFromExcel(data: any[]) {
        return new Promise<{}>(async (resolve, reject) => {
            let articlesObject: any = {};
            const response = {
                updateCompany: <any>[],
                notUpdateCompany: <any>[],
                countUpdate: 0,
                countNotUpdate: 0
            };
            data.forEach((item) => {
                articlesObject[item.column6] = item;
                response.notUpdateCompany.push(item.column6);
            });

            const identificationValue = data.map((obj) => obj.column6);
            const name = data.map((obj) => obj.column1)
            const type = data.map((obj) => obj.column3)
            const typeIdentification = data.map((obj) => obj.column5)
            const vatCondition = data.map((obj) => obj.column4)

            try {
                if (vatCondition.some(vatCondition => vatCondition === '')) {
                    return reject(new Responser(500, null, "Condiciónes de IVA estan incompletos en el archivo Excel."))
                }
                if (identificationValue.some(identificationValue => identificationValue === '') || name.some(name => name === '')) {
                    return reject(new Responser(500, null, "Hay números de identificación o nombres de empresas incompletos en el archivo Excel."))
                }
                if (type.some(type => type === '') || typeIdentification.some(typeIdentification => typeIdentification === '')) {
                    return reject(new Responser(500, null, "Tipos de empresas o tipos de identificación incompletos en el archivo Excel."))
                }

                const company: Company[] = await new CompanyController(this.database).find(
                    { identificationValue: { $in: identificationValue }, name: { $in: name } }, {}
                );
                if (company.length) {
                    for (const companyObj of company) {
                        const identificationValue = companyObj.identificationValue;
                        if (!response.updateCompany.includes(identificationValue)) {
                            response.updateCompany.push(identificationValue);
                        }
                        const indexToRemove = response.notUpdateCompany.indexOf(identificationValue);
                        if (indexToRemove !== -1) {
                            response.notUpdateCompany.splice(indexToRemove, 1);
                        }
                    }
                }

                const nonExistingCodes = identificationValue.filter(code => !company.map((item: Company) => item.identificationValue).includes(code));

                const createPromises = nonExistingCodes.map(async (item: any) => {
                    const companyData = articlesObject[item];

                    let vatCondition = await this.getVatCondition(companyData.column4)
                    let identificationTypes = await this.getIdentificationType(companyData.column5)
                    let countryId = await this.getCoutry(companyData.column14)
                    let stateId = await this.getState(companyData.column14)

                    let company: Company = CompanySchema.getInstance(this.database);
                    company = Object.assign(company, {
                        name: companyData.column1,
                        fantasyName: companyData.column2,
                        type: companyData.column3,
                        vatCondition: vatCondition,
                        identificationType: identificationTypes,
                        identificationValue: companyData.column6,
                        grossIncome: companyData.column7,
                        address: companyData.column8,
                        addressNumber: companyData.column9,
                        floorNumber: companyData.column10,
                        flat: companyData.column11,
                        zipCode: companyData.column12,
                        country: countryId,
                        state: stateId,
                        city: companyData.column15,
                        phones: companyData.column16,
                        emails: companyData.column17,
                        gender: companyData.column18 === '' ? null : companyData.column18,
                        birthday: companyData.column19 === '' ? '' : moment(companyData.column19, 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                        allowCurrentAccount: companyData.column20 === 'Si',
                        creditLimit: companyData.column21,
                    });
                    const result = await new CompanyController(this.database).save(company);
                    if (result.status === 200) {
                        const identificationValuesss = result.result.identificationValue;
                        if (!response.updateCompany.includes(identificationValuesss)) {
                            response.updateCompany.push(identificationValue);
                        }
                        const indexToRemove = response.notUpdateCompany.indexOf(identificationValue);
                        if (indexToRemove !== -1) {
                            response.notUpdateCompany.splice(indexToRemove, 1);
                        }
                    }

                    return result;
                })
                await Promise.all(createPromises);
            } catch (error) {
                console.log(error)
            }
            response.countUpdate = response.updateCompany.length;
            response.countNotUpdate = response.notUpdateCompany.length;
            resolve(response)
        })
    }

    async getVatCondition(dato: string) {
        try {
            let vatCondition: VATCondition[] = await new VATConditionController(this.database).find({ description: dato }, {})
            if (vatCondition.length > 0) {
                return vatCondition[0]._id
            }
            return null
        } catch (error) {
            throw error;
        }
    }

    async getIdentificationType(dato: string) {
        try {
            const identificationTypes: IdentificationType[] = await new IdentificationTypeController(this.database).find({ name: dato }, {});

            if (identificationTypes.length > 0) {
                return identificationTypes[0]._id;
            }
            return null
        } catch (error) {
            throw error;
        }
    }

    async getCoutry(data: string) {
        try {
            let country: Country[] = await new CountryController(this.database).find({ name: data }, {})
            if (country.length > 0) {
                return country[0]._id
            }
            return null
        } catch (error) {
            console.log(error)
        }
    }

    async getState(data: string) {
        try {
            let state: State[] = await new StateController(this.database).find({ name: data }, {})
            if (state.length > 0) {
                return state[0]._id
            }
            return null
        } catch (error) {
            console.log(error)
        }
    }

}
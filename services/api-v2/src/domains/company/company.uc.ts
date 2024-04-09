import * as axios from 'axios'
import CompanyController from './company.controller'
import Company from './company.interface'
import CompanySchema from './company.model'
import VATConditionController from '../vat-condition/vat-condition.controller'
import IdentificationTypeController from '../identification-type/identification-type.controller'
import VATCondition from '../vat-condition/vat-condition.interface'
import IdentificationType from '../identification-type/identification-type.interface'
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
            const response = {
                updateCompany: <any>[],
                notUpdateCompany: <any>[],
                countUpdate: 0,
                countNotUpdate: 0
            };
    
            const companiesObj: any = {};
    
            const companies = await new CompanyController(this.database).getAll({
                project: {
                    identificationValue: 1
                }
            });
    
            companies.result.forEach((item: any) => {
                if (item.identificationValue) {
                    companiesObj[item.identificationValue] = item;
                }
            });

            let vatConditionsObj = await this.getVatConditions();
            let identificationTypesObj = await this.getIdentificationTypes();
            let countriesObj = await this.getCountries();
            let statesObj = await this.getStates();
    
            for (const item of data) {
                let identificationValue = item.column6;
                if (companiesObj[identificationValue] && identificationValue !== '99999999') {
                    // response.updateCompany.push(identificationValue);
                } else {
                    let company = CompanySchema.getInstance(this.database);
                    
                    company = Object.assign(company, {
                        name: item.column1,
                        fantasyName: item.column2,
                        type: item.column3,
                        vatCondition: vatConditionsObj[item.column4],
                        identificationType: identificationTypesObj[item.column5],
                        identificationValue: identificationValue == '' ? '99999999' : identificationValue,
                        grossIncome: item.column7,
                        address: item.column8,
                        addressNumber: item.column9,
                        floorNumber: item.column10,
                        flat: item.column11,
                        zipCode: item.column12,
                        country: countriesObj[item.column13],
                        state: statesObj[item.column14],
                        city: item.column15,
                        phones: item.column16,
                        emails: item.column17,
                        gender: item.column18 === '' ? null : item.column18,
                        birthday: item.column19 === '' ? '' : moment(item.column19, 'DD/MM/YYYY').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                        allowCurrentAccount: item.column20 === 'Si',
                        creditLimit: item.column21,
                    });
    
                    const result = await new CompanyController(this.database).save(company);
                    if (result.status === 200) {
                        const identificationValuesss = result.result.identificationValue;
                        if (!response.updateCompany.includes(identificationValuesss)) {
                            response.updateCompany.push(identificationValuesss);
                        }
                        const indexToRemove = response.notUpdateCompany.indexOf(identificationValuesss);
                        if (indexToRemove !== -1) {
                            response.notUpdateCompany.splice(indexToRemove, 1);
                        }
                    }
                }
            }
    
            response.countUpdate = response.updateCompany.length;
            response.countNotUpdate = response.notUpdateCompany.length;
            resolve(response);
        });
    }

    async getVatConditions() {
        try {
            const vatConditionsObj: any = {};
            let vatConditions: VATCondition[] = await new VATConditionController(this.database).find({}, {})

            vatConditions.forEach((item: any) => {
                vatConditionsObj[item.description] = item;
            });
            return vatConditionsObj
        } catch (error) {
            throw error;
        }
    }

    async getIdentificationTypes() {
        try {
            const identificationTypesObj: any = {}
            const identificationTypes: IdentificationType[] = await new IdentificationTypeController(this.database).find({}, {});

            identificationTypes.forEach((item: any) => {
                identificationTypesObj[item.name] = item;
            });
            return identificationTypesObj
        } catch (error) {
            throw error;
        }
    }

    async getCountries() {
        try {
            let countriesObj: any = {}
            let countries: Country[] = await new CountryController(this.database).find({}, {})

            if (countries.length > 0) {
            countries.forEach((item: any) => {
                countriesObj[item.name] = item;
            });
            return countriesObj
        }
        return null
        } catch (error) {
            console.log(error)
        }
    }

    async getStates() {
        try {
            let stateObj: any = {}
            let states: State[] = await new StateController(this.database).find({}, {})
            if (states.length > 0) {
               states.forEach((item: any) => {
                stateObj[item.name] = item;
            });
            return stateObj
            }
            return null
        } catch (error) {
            console.log(error)
        }
    }

}
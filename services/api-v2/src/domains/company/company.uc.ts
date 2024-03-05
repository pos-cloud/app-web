import * as axios from 'axios'
import CompanyController from './company.controller'
import Company from './company.interface'
import CompanySchema from './company.model'
import VATConditionController from '../vat-condition/vat-condition.controller'
import IdentificationTypeController from '../identification-type/identification-type.controller'
import VATCondition from '../vat-condition/vat-condition.interface'
import IdentificationType from '../identification-type/identification-type.interface'

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
                articlesObject[item.column7] = item;
                response.notUpdateCompany.push(item.column7);
            });

            const identificationValue = data.map((obj) => obj.column7);
            const name = data.map((obj) => obj.column1)
            
            try {
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
                 
                    let vatCondition = await this.getVatCondition(companyData.column5)
                    let identificationTypes = await this.getIdentificationType(companyData.column6)
            
                    let company: Company = CompanySchema.getInstance(this.database);
                    company = Object.assign(company, {
                        name: companyData.column1,
                        fantasyName: companyData.column2,
                        type: companyData.column3,
                        category: companyData.column4,
                        vatCondition: vatCondition,
                        identificationType: identificationTypes,
                        identificationValue: companyData.column7,
                        grossIncome: companyData.column8,
                        address: companyData.column9,
                        city: companyData.column11,
                        phones: companyData.column11,
                        emails: companyData.column12,
                        birthday: companyData.column13,
                        gender: companyData.column14,
                        observation: companyData.column15,
                        allowCurrentAccount: companyData.column16 == 'Si'? true : false,
                        floorNumber: companyData.column17,
                        flat: companyData.column18,
                        addressNumber: companyData.column19,
                        latitude: companyData.column20,
                        longitude: companyData.column21,
                        discount: companyData.column22,
                        creditLimit: companyData.column23,
                        zipCode: companyData.column24,
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

    async getVatCondition(dato: string){
        try {
            let vatCondition: VATCondition[] = await new VATConditionController(this.database).find({ description: dato }, {})
            if(vatCondition.length > 0){
                return vatCondition[0]._id
            }
            return ''
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
            return ''
        } catch (error) {
            throw error;
        }
    }
    
}
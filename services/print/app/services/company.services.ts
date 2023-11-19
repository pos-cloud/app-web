import Company from "../models/company";
import axios from "axios";

export async function getCompany(token: string, companyId: string): Promise<Company> {
    try {
        const URL = `${process.env.APIV1}company`;
        const headers = {
            'Authorization': token,
        };
        const params = {
            id: companyId,
        };

        const data = await axios.get(URL, { headers, params })
        const response: Company = data.data.company

        return response
    } catch (error) {
        console.log(error)
    }
}
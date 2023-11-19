import axios from "axios";
import Transaction from "../models/transaction";

export async function getTransactionById(id: string, token: string): Promise<Transaction> {
   try {
    const URL = `${process.env.APIV1}transaction`;
    const headers = {
        'Authorization': token,
    };
    const params = {
        id: id,
    };

    const data = await axios.get(URL, { headers, params })
    const response: Transaction = data.data.transaction
    return response
   } catch (error) {
    console.log(error)
   }
}
import axios from "axios";
import MovementOfCash from "models/movement-of-cash";

export async function getMovementsOfCash(token: string, id: string): Promise<MovementOfCash[]>{
  try {
    let query = 'where="transaction":"' + id + '"'
    const URL = `${process.env.APIV1}movements-of-cashes`;
    const headers = {
        'Authorization': token,
    };

    const params = {
      query: query,
    }
    const data = await axios.get(URL, { headers, params })
    const response: MovementOfCash[] = data.data.movementsOfCashes
    return response
   } catch (error) {
    return error
   }
}
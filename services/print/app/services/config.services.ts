import Config from "../models/config";
import axios from "axios";

export async function getConfig(token:string) : Promise<Config[]> {
    try {
        const URL = `${process.env.APIV1}config`;
        const headers = {
            'Authorization': token,
        };

        const data = await axios.get(URL, { headers })
        const response: Config[] = data.data.configs
        return response
    } catch (error) {
        console.log(error)
    }
}

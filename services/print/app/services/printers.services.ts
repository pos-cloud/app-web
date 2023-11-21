import Printer from "models/printer";
import axios from "axios";

export async function getPrinters(token: string, query: string): Promise<Printer | undefined> {
    try {
        const URL = `${process.env.APIV1}printers`;
        const headers = {
            'Authorization': token,
        };

        const data = await axios.get(URL, { headers })
        const response: Printer[] = data.data.printers

        const foundPrinter = response.find(printer => printer.printIn === query);

        return foundPrinter
    } catch (error) {
        console.log(error)
    }
}
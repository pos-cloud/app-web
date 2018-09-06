import { Company } from './company';

import * as moment from 'moment';
import 'moment/locale/es';

export class CompanyNews {

	public _id: string;
	public date: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public news: string = "";
	public state: CompanyNewsState = CompanyNewsState.Pending;
	public company: Company;

	constructor() { }
}

export enum CompanyNewsState {
	Finish = <any>"Finalizada",
	Pending = <any>"Pendiente"
}
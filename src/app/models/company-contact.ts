import { Company } from './company';

import * as moment from 'moment';
import 'moment/locale/es';

export class CompanyContact {

	public _id: string;
    public name: string = '';
    public phone: string = '';
    public position : string = '';
	public company: Company;

	constructor() { }
}

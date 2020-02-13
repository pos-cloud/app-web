import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class EmailTemplate {
	
	public _id: string;
    public name: string = '';
    public design: string = '';
    public operationType : string;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
    public updateDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    
	constructor () {}
}

export let attributes = [
	{
		name: 'name',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		project: null,
		align: 'left',
		required: false,
	},
	{
		name: 'design',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		project: null,
		align: 'left',
		required: false,
	},
	{
		name: 'operationType',
		visible: false,
		disabled: true,
		filter: false,
		datatype: 'string',
		defaultFilter: `{ "$ne": "D" }`,
		project: null,
		align: 'left',
		required: true,
	}
];
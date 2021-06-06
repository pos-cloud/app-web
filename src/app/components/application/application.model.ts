import { IAttribute } from 'app/util/attribute.interface';
import { Article } from '../article/article';
import { Category } from '../category/category';
import { EmailTemplate } from '../email-template/email-template';
import { Model } from '../model/model.model';

export class Application extends Model {

    public order: number;
    public name: string;
    public url: string;
    public type: ApplicationType;
    public socialNetworks: {
        facebook: string,
        instagram: string,
        youtube: string,
        twitter: string,
    };
    public contact: {
        phone: number,
        whatsapp: number,
        claim: number,
    }
    public design: {
        labelNote : string,
        about: string,
        categoryTitle: string,
        categoriesByLine: number,
        showSearchBar: boolean,
        resources: {
            logo: string,
            banners: string[]
        },
        colors: {
            primary: string,
            secondary: string,
            tercery: string,
            backgroud : string,
            backgrounHeader : string,
            backgroundFooter : string,
            font : string;
        },
        font: {
            family: string,
            weight: string,
            style: string,
            size: string,
        }
        home: {
            title: string,
            view: string,
            order: number,
            resources: {
                article: Article,
                category: Category,
                banner: string,
                order: number,
                link: string
            }[]
        }[]
    };
    public auth: {
        requireOPT: boolean
    };
    public integrations: {
		meli: {
            code: { type: String },
            token: { type: String },
            refreshToken: { type: String }
		}
	};
    public notifications: {
        app: {
            checkout: string,
            temporaryMessage: string
        },
        email: {
            checkout: string
        }
    };

    public schedule: {
        day: string,
        from: string,
        to: string
    }[]

    public email: {
        register: {
            enabled : boolean,
            template : EmailTemplate
        },
        endTransaction: {
            enabled : boolean,
            template : EmailTemplate
        },
        statusTransaction: {
            paymentConfirmed: {
                enabled : boolean,
                template : EmailTemplate
            },
            paymentDeclined: {
                enabled : boolean,
                template : EmailTemplate
            },
            closed: {
                enabled : boolean,
                template : EmailTemplate
            },
            sent: {
                enabled : boolean,
                template : EmailTemplate
            },
            delivered: {
                enabled : boolean,
                template : EmailTemplate
            },
        }
    }

    constructor() { super(); }

    static getAttributes(): IAttribute[] {
        return Model.getAttributes([
            {
                name: 'order',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'number',
                project: null,
                align: 'center',
                required: false,
            },
            {
                name: 'name',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'url',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            },
            {
                name: 'type',
                visible: true,
                disabled: false,
                filter: true,
                defaultFilter: null,
                datatype: 'string',
                project: null,
                align: 'left',
                required: false,
            }
        ])
    }
}

export enum ApplicationType {
    Web = <any>"Web",
    App = <any>"App"
}

import { IAttribute } from 'app/util/attribute.interface';
import { Article } from '../article/article';
import { Category } from '../category/category';
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
    about: string,
    categoryTitle: string,
    categoriesByLine: number,
    showSearchBar: boolean,
    resources: {
      logo: string,
      banners: string[]
    },
    colors : {
        primary : string,
        secondary : string,
        tercery : string
    },
    home : {
        title : string,
        view : string,
        order : number,
        resources : {
            article : Article,
            category : Category,
            banner : string,
            order : number,
            link : string
        }[]
    }[]
  };
  public auth: {
    requireOPT: boolean
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

  public schedule : {
    day : string,
    from : string,
    to : string
  }[]

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

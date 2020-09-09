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
  }
  public design: {
    about: string,
    categoryTitle: string,
    categoriesByLine: number,
    showSearchBar: boolean,
    resources: {
      banners: string[]
    }
  };
  public auth: {
    requireOPT: boolean
  };
  public notifications: {
    app: {
      checkout: string
    },
    email: {
      checkout: string
    }
  };

  constructor() { super(); }

  static getAttributes(): {
    name: string,
    visible: boolean,
    disabled: boolean,
    filter: boolean,
    defaultFilter: string,
    datatype: string,
    project: any,
    align: string,
    required: boolean
  }[] {
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

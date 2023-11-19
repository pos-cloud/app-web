import EmailTemplate from 'domains/email-template/email-template.interface'

import Article from './../../domains/article/article.interface'
import Category from './../../domains/category/category.interface'
import Model from './../../domains/model/model.interface'

export default interface Application extends Model {
  order: number
  name: string
  url: string
  type: ApplicationType
  socialNetworks: {
    facebook: string
    instagram: string
    youtube: string
    twitter: string
  }
  contact: {
    phone: number
    whatsapp: number
    claim: number
  }
  design: {
    labelNote: string
    about: string
    categoryTitle: string
    categoriesByLine: number
    showSearchBar: boolean
    resources: {
      logo: string
      banners: string[]
    }
    colors: {
      primary: string
      secondary: string
      tercery: string
      background: string
      backgroundHeader: string
      backgroundFooter: string
      font: string
    }
    home: {
      title: string
      view: string
      order: number
      resources: {
        article: Article
        category: Category
        banner: string
        order: number
        link: string
      }[]
    }[]
    font: {
      family: string
      weight: string
      style: string
      size: string
    }
  }
  auth: {
    requireOPT: boolean
    messageOPT: string
  }
  integrations: {
    meli: {
      code: string
      token: string
      refreshToken: string
    }
  }
  notifications: {
    app: {
      checkout: string
      temporaryMessage: string
    }
    email: {
      checkout: string
    }
  }
  schedule: {
    day: string
    to: string
    from: string
  }[]
  email: {
    register: {
      enabled: boolean
      template: EmailTemplate
    }
    endTransaction: {
      enabled: boolean
      template: EmailTemplate
    }
    statusTransaction: {
      paymentConfirmed: {
        enabled: boolean
        template: EmailTemplate
      }
      paymentDeclined: {
        enabled: boolean
        template: EmailTemplate
      }
      closed: {
        enabled: boolean
        template: EmailTemplate
      }
      sent: {
        enabled: boolean
        template: EmailTemplate
      }
      delivered: {
        enabled: boolean
        template: EmailTemplate
      }
    }
  }
}

export enum ApplicationType {
  Web = <any>'Web',
  App = <any>'App',
  Woocommerce = <any>'Woocommerce',
  MercadoLibre = <any>'MercadoLibre',
}

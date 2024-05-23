import { IsDefined, IsString, IsNumber, ValidateIf } from 'class-validator'
import EmailTemplate from 'domains/email-template/email-template.interface'

import Article from './../../domains/article/article.interface'
import Category from './../../domains/category/category.interface'
import ModelDto from './../../domains/model/model.dto'
import { ApplicationType } from './application.interface'
import { TransactionType } from '../transaction-type/transaction-type.interface'
import { ShipmentMethod } from '../shipment-method/shipment-method.interface'
import PaymentMethod from '../payment-method/payment-method.interface'
import Company from '../company/company.interface'

export default class ApplicationDto extends ModelDto {
  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsNumber()
  order: number

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
  name: string

  @ValidateIf((o) => o.url !== undefined)
  @IsString()
  url: string

  @ValidateIf((o) => !o._id)
  @IsDefined()
  @IsString()
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

  tiendaNube: {
    userId: number,
    token: string,
    transactionType: TransactionType,
    shipmentMethod: ShipmentMethod,
    paymentMethod: PaymentMethod,
    company: Company,
    article: Article
  }
  menu: {
    portain: string,
    background: string
    article: {
      font: string,
      size: number,
      color: string,
      style: string,
      weight: string
    },
    category: {
      font: string,
      size: number,
      color: string,
      style: string,
      weight: string
    },
    price: {
      font: string,
      size: number,
      color: string,
      style: string,
      weight: string
    },
    observation: {
      font: string,
      size: number,
      color: string,
      style: string,
      weight: string
    }
  }

}

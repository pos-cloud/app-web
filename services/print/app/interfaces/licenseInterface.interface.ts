export interface License {
  creationAt: string
  numberOfBookings: number
  numberOfProfessionals: number
  token?: string
  billingDate: string
  status: LicenseStatus
  trialPeriodEnded: boolean
  preapprovalId: string
}
export enum LicenseStatus {
  ACTIVE = <any>'active',
  NOT_ACTIVE = <any>'not active',
  OUTSTANDING = <any>'outstanding',
}

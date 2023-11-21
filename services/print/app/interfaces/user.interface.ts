export interface UserI {
    //branch: Branch
    name: string;
    phone: string;
    email: string;
    password: string;
    state: UserState;
    opt: string;
    token: string;
    refreshToken: string;
    shortcuts: [{ name: string; url: string }];
    level: number;
    tokenExpiration: number;
    //employee: Employee
    //company: Company
    //origin: Origin
    //printers: [{printer: Printer}]
    //cashBoxType: CashBoxType
    //permission?: Permission
  }
  
  enum UserState {
    Enabled = <any>'Habilitado',
    Disabled = <any>'No Habilitado',
  }
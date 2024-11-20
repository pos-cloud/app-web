export interface IAttribute {
    name: string,
    visible?: boolean,
    disabled?: boolean,
    filter?: boolean,
    defaultFilter?: string,
    datatype: string,
    project?: any,
    align: string,
    required?: boolean
}
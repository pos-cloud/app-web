import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {

  result: any;
  strVal: string = "";
  strArg: string = "";
//   terms: string[];
  valueAux: any[];

  transform(value: any[], term: string, property: string, subobject?:string, ): any {

    if (term === undefined || !(term) || !value) {

        this.result = value;
    } else {

        // this.terms = term.split(';');
        // if (this.terms.length == 1){    //nos permite hacer busqueda por varios campos en un solo inpu seguido de ';'
        //      this.valueAux = value;
        // }

        this.valueAux = value;

        this.result = this.valueAux.filter(item => {
            
            for (let key in item) {

                if(subobject !== undefined) {

                    if(key === subobject) {  //rechaza buscar por _id, y verifica si cual es la propiedad del objeto
                        
                        this.strVal = ""+item[key][property];
                        // this.strArg = ""+this.terms[this.terms.length-1];
                        this.strArg = term;
                        if(this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                            return true;
                        }
                    }
                } else if(property !== undefined) {

                    if(key != "_id" && key === property) {  //rechaza buscar por _id, y verifica si cual es la propiedad del objeto
                        
                        this.strVal = ""+item[key];
                        this.strArg = term;
                        if(this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                            return true;
                        }
                    }
                } else {
                    
                    if(key != "_id") {   //rechaza buscar por _id

                        this.strVal = ""+item[key];
                        this.strArg = term;
                        
                        if(this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                            return true;
                        }
                    }
                }
            }
        });
        this.valueAux = this.result;
    }
    return this.result;
  }
}

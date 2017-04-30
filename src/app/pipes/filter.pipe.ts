import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {

  result: any;
  strVal: string = "";
  strArg: string = "";
  terms: string[];
  valueAux: any[];

  transform(value: any[], args: any): any {
    if (args === undefined || !(args)) {
        this.result = value;
    } else if (value) {
        this.terms = args.split(';');
        if (this.terms.length == 1){
            this.valueAux = value;
        }
        this.result = this.valueAux.filter(item => {
            for (let key in item) {
                if(key != "_id"){
                this.strVal = ""+item[key];
                this.strArg = ""+this.terms[this.terms.length-1];
                    if(this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                        return true;
                    }
                }
                
            }
        });
        this.valueAux = this.result;
    }
    return this.result;
  }
}

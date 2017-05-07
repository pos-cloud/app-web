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

  transform(value: any[], arg1: string, arg2: string): any {
    if (arg1 === undefined || !(arg1)) {
        this.result = value;
    } else if (value) {
        this.terms = arg1.split(';');
        if (this.terms.length == 1){
            this.valueAux = value;
        }
        this.result = this.valueAux.filter(item => {
            for (let key in item) {
                if(arg2 === ""){
                    if(key != "_id" && key === arg2){
                        this.strVal = ""+item[key];
                        this.strArg = ""+this.terms[this.terms.length-1];
                        if(this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                            return true;
                        }
                    }
                } else {
                    if(key != "_id"){
                        this.strVal = ""+item[key];
                        this.strArg = ""+this.terms[this.terms.length-1];
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

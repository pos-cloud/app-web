import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {

  result: any;
  strVal: string = "";
  strArg: string = "";
  terms: string[];
  valueAux: any[];

  transform(value: any[], term: string, property: string, subobject?:string): any {

    if (term === undefined || !(term) || !value) {

        this.result = value;
    } else {

        // this.terms = term.split(';');
            // if (this.terms.length == 1){    //nos permite hacer busqueda por varios campos en un solo inpu seguido de ';'
            //      this.valueAux = value;
            // }

        // if(property && property.toLowerCase().includes('date'.toLowerCase())) {
        //     let termsDate = term.split('/');
        //     let termsHour = term.split(':');
        //     let day;
        //     let month;
        //     let year;
        //     let hour;
            
        //     if (termsDate[0] && !termsDate[0].includes(":")) {
        //         if(parseFloat(termsDate[0]) <= 12) {
        //             if (termsDate[1] && parseFloat(termsDate[1]) <= 12 && termsDate[2] && parseFloat(termsDate[2]) >= 31) {
        //                 day = termsDate[0];
        //             } else if (termsDate[1] && parseFloat(termsDate[1]) >= 32)  {
        //                 month = termsDate[0];
        //             } else {
        //                 day = termsDate[0];
        //             }
        //         } else if (parseFloat(termsDate[0]) >= 32) {
        //             year = termsDate [0];
        //         } else {
        //             day = termsDate[0];
        //         }
        //     }
        //     if (termsDate[1] && !termsDate[1].includes(":")) {
        //         if(month) {
        //             year = termsDate[1];
        //         } else {
        //             month = termsDate[1];
        //         }
        //     }
        //     if (termsDate[2]) {
        //         let termsDateComplete = termsDate[2].split(" ");
        //         year = termsDateComplete[0];
        //     }

        //     term = "";
            
        //     if(day) {
        //         term += day;
        //     }
        //     if (month) {
        //         if(day) {
        //             term = "/"+term;
        //         }
        //         term = month + term;
        //     }
        //     if (year) {
        //         if (month) {
        //             term = "/" + term;
        //         }
        //         term = year + term;
        //     }

        //     console.log(term);

        //     if (termsHour[1] && !termsHour[0].includes(' ')) {
        //         term += termsHour[0] + ":" + termsHour[1]; 
        //         if (termsHour[2]) {
        //             term += ":" + termsHour[2];
        //         }
        //     } else if (termsHour[1]) {
        //         term += termsHour[0].split(' ')[1] + ":" + termsHour[1];
        //         if (termsHour[2]) {
        //             term += ":" + termsHour[2];
        //         }
        //     }
        //     console.log("dia" + day);
        //     console.log("mes" + month);
        //     console.log("año" + year);
            
        //     console.log(term);

        //     //2017/10/30 21:13:26
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

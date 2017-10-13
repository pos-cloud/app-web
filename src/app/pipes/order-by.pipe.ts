import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  pure: false
})

export class OrderByPipe implements PipeTransform {

  static _orderByComparator(a:any, b:any):number{

        //Si la variable es indefinida la seteamos en blanco
        if(a === undefined || a === null) {
            a="";
        }
        if (b === undefined || b === null) {
            b="";
        }

        if((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))){
        //Si no es un número convertimos en minúscula para comparar correctamente
        if(a.toLowerCase() < b.toLowerCase()) return -1;
        if(a.toLowerCase() > b.toLowerCase()) return 1;
    }
    else{
        //Parsear las cadenas como números para comparar correctamente
        if(parseFloat(a) < parseFloat(b)) return -1;
        if(parseFloat(a) > parseFloat(b)) return 1;
    }

    return 0; //equal each other
    }

    //input = Array a comparar
    //config = propiedad a comparar u objecto de otro objeto
    //arg2 = si existe objeto de otro objeto es la propiedad del segundo objeto a comparar
    transform(input:any, [config = '+'], arg2?: string): any{

        //Si no existe mas de un elemento
        if(!Array.isArray(input)) return input;

        if(!Array.isArray(config) || (Array.isArray(config) && config.length == 1)){
            var propertyToCheck:string = !Array.isArray(config) ? config : config[0];
            var desc = propertyToCheck.substr(0, 1) == '-';
            
            //Array Básico
            if(!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+'){
                return !desc ? input.sort() : input.sort().reverse();
            } else {
                var property:string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
                    ? propertyToCheck.substr(1)
                    : propertyToCheck;

                //a = es el primer objeto a comparar
                //b = es el segundo objeto a comparar
                return input.sort(function(a:any,b:any){
                    
                    var response;
                    //desc = descendiente o ascendente
                    if(!desc){
                        //Verificamos si no hay un obejeto dentro de otro
                        if(arg2 !== undefined) {
                            //En caso de que haya un objeto dentro de otro, pero la relacion no exista crea una relacion ficticia
                            if (a[property] === undefined || a[property] === null) {
                                a[property] = new Array();
                                a[property][arg2] = "";
                            }
                            if (b[property] === undefined || b[property] === null) {
                                b[property] = new Array();
                                b[property][arg2] = "";
                            }
                            response = OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                        } else {
                            response = OrderByPipe._orderByComparator(a[property], b[property]);
                        }
                    } else {
                        if(arg2 !== undefined) {
                            if (a[property] === undefined || a[property] === null) {
                                a[property] = new Array();
                                a[property][arg2] = "";
                            }
                            if (b[property] === undefined || b[property] === null) {
                                b[property] = new Array();
                                b[property][arg2] = "";
                            }
                            response = -OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                        } else {
                            response = -OrderByPipe._orderByComparator(a[property], b[property]);
                        }
                    }
                    return response;
                });
            }
        } else {
            //Bucle sobre la propiedad de la matriz en orden y ordenar
            return input.sort(function(a:any,b:any){
                for(var i:number = 0; i < config.length; i++){
                    var desc = config[i].substr(0, 1) == '-';
                    var property = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
                        ? config[i].substr(1)
                        : config[i];

                    var comparison = !desc 
                        ? OrderByPipe._orderByComparator(a[property], b[property]) 
                        : -OrderByPipe._orderByComparator(a[property], b[property]);
                    
                    //No devuelva 0 todavía en caso de necesitar ordenar por la propiedad siguiente
                    if(comparison != 0) return comparison;
                }

                return 0; //Iguales entre sí
            });
        }
    }
}
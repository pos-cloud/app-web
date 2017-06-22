import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  pure: false
})

export class OrderByPipe implements PipeTransform {

  static _orderByComparator(a:any, b:any):number{
      
        if(a === undefined) {
            a="";
        }
        if(b === undefined) {
            b="";
        }
        if((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))){
        //Isn't a number so lowercase the string to properly compare
        if(a.toLowerCase() < b.toLowerCase()) return -1;
        if(a.toLowerCase() > b.toLowerCase()) return 1;
    }
    else{
        //Parse strings as numbers to compare properly
        if(parseFloat(a) < parseFloat(b)) return -1;
        if(parseFloat(a) > parseFloat(b)) return 1;
    }

    return 0; //equal each other
    }

    transform(input:any, [config = '+'], arg2?: string): any{

        if(!Array.isArray(input)) return input;

        if(!Array.isArray(config) || (Array.isArray(config) && config.length == 1)){
            var propertyToCheck:string = !Array.isArray(config) ? config : config[0];
            var desc = propertyToCheck.substr(0, 1) == '-';
            
            //Basic array
            if(!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+'){
                return !desc ? input.sort() : input.sort().reverse();
            } else {
                var property:string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
                    ? propertyToCheck.substr(1)
                    : propertyToCheck;

                return input.sort(function(a:any,b:any){
                    
                    var response;
                    if(!desc){
                        if(arg2 !== undefined) {
                            response = OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                        } else {
                            response = OrderByPipe._orderByComparator(a[property], b[property]);
                        }
                    } else {
                        if(arg2 !== undefined) {
                            response = -OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                        } else {
                            response = -OrderByPipe._orderByComparator(a[property], b[property]);
                        }
                    }
                    return response;
                });
            }
        }
        else {
            //Loop over property of the array in order and sort
            return input.sort(function(a:any,b:any){
                for(var i:number = 0; i < config.length; i++){
                    var desc = config[i].substr(0, 1) == '-';
                    var property = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
                        ? config[i].substr(1)
                        : config[i];

                    var comparison = !desc 
                        ? OrderByPipe._orderByComparator(a[property], b[property]) 
                        : -OrderByPipe._orderByComparator(a[property], b[property]);
                    
                    //Don't return 0 yet in case of needing to sort by next property
                    if(comparison != 0) return comparison;
                }

                return 0; //equal each other
            });
        }
    }
}
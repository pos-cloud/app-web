import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';

@Pipe({
  name: 'orderBy',
  pure: false
})

export class OrderByPipe implements PipeTransform {

  static _orderByComparator(a:any, b:any): number {

    //Si la variable es indefinida la seteamos en blanco
    if (a === undefined || a === null) {
        if (b && !isNaN(b)) {
            a = 0;
        } else {
            a = '';
        }
    }

    if (b === undefined || b === null) {
        if (a && !isNaN(a)) {
            b = 0;
        } else {
            b = '';
        }
    }

    if (!isNaN(a)) {
      a = a.toString();
    }

    if (!isNaN(b)) {
      b = b.toString();
    }

    try {
      if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
          //Si no es un número convertimos en minúscula para comparar correctamente
          if (a.toLowerCase() < b.toLowerCase()) return -1;
          if (a.toLowerCase() > b.toLowerCase()) return 1;
      } else {
          //Parsear las cadenas como números para comparar correctamente
          if (parseFloat(a) < parseFloat(b)) return -1;
          if (parseFloat(a) > parseFloat(b)) return 1;
      }
    } catch (err) {
      console.log(err);
    }

    return 0; //equal each other
  }

  //input = Array a comparar
  //config = propiedad a comparar u objecto de otro objeto
  //arg2 = si existe objeto de otro objeto es la propiedad del segundo objeto a comparar
  transform(input:any, [config = '+'], arg2?: string): any{
    console.log(config);
    console.log(input);
    console.log(arg2);
    //Si no existe mas de un elemento en la lista a ordenar
    if (!Array.isArray(input)) return input;

    if (!Array.isArray(config) || (Array.isArray(config) && config.length == 1)) {

      let propertyToCheck: string = !Array.isArray(config) ? config : config[0];
      let desc: boolean = propertyToCheck.substr(0, 1) == '-';

      //Array Básico
      if (!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+') {
          return !desc ? input.sort() : input.sort().reverse();
      } else {
          let property: string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
              ? propertyToCheck.substr(1)
              : propertyToCheck;

          //a = es el primer objeto a comparar
          //b = es el segundo objeto a comparar
          return input.sort(function(a: any,b: any) {

              let response: number;
              //desc = descendiente o ascendente
              if (!desc) {
                  //Verificamos si no hay un obejeto dentro de otro
                  if (arg2 !== undefined) {
                      //En caso de que haya un objeto dentro de otro, pero la relacion no exista crea una relacion ficticia
                      if (a[property] === undefined || a[property] === null) {
                          a[property] = new Array();
                          a[property][arg2] = '';
                      }
                      if (b[property] === undefined || b[property] === null) {
                          b[property] = new Array();
                          b[property][arg2] = '';
                      }
                      response = OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                  } else {
                      response = OrderByPipe._orderByComparator(a[property], b[property]);
                  }
              } else {
                  if (arg2 !== undefined) {
                      if (a[property] === undefined || a[property] === null) {
                          a[property] = new Array();
                          a[property][arg2] = '';
                      }
                      if (b[property] === undefined || b[property] === null) {
                          b[property] = new Array();
                          b[property][arg2] = '';
                      }
                      response = -OrderByPipe._orderByComparator(a[property][arg2], b[property][arg2]);
                  } else {
                      if (property.toLowerCase().includes('date')) {
                          let dateFormat: DateFormatPipe = new DateFormatPipe();
                          response = -OrderByPipe._orderByComparator(dateFormat.transform(a[property], "YYYY/MM/DD HH:mm:ss"), dateFormat.transform(b[property], "YYYY/MM/DD HH:mm:ss"));
                      } else {
                          response = -OrderByPipe._orderByComparator(a[property], b[property]);
                      }
                  }
              }
              return response;
          });
      }
    } else {
      //Bucle sobre la propiedad de la matriz en orden y ordenar
      return input.sort(function(a:any, b:any) {
        for(let i: number = 0; i < config.length; i++) {
            let desc: boolean = config[i].substr(0, 1) == '-';
            let property: string = config[i].substr(0, 1) == '+' || config[i].substr(0, 1) == '-'
                ? config[i].substr(1)
                : config[i];

            let comparison = !desc
                ? OrderByPipe._orderByComparator(a[property], b[property])
                : -OrderByPipe._orderByComparator(a[property], b[property]);

            //No devuelva 0 todavía en caso de necesitar ordenar por la propiedad siguiente
            if (comparison != 0) return comparison;
        }

        return 0; //Iguales entre sí
      });
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ExtractArrayValuePipe'
})
export class ExtractArrayValuePipe implements PipeTransform {

  transform(value: any, args: string): any {
    let total: number = 0;
    if (args === 'number') {
      let numberArray: number[] = [];
      for (let i = 0; i < value; i++) {
        // numberArray.push(value[i].number);
        numberArray.push(i);
      }
      return numberArray;
    }
    if (args === 'invoices') {
      value.forEach((invoice: any) => {
        total += invoice.total;
      })
      return total.toFixed(2); //2 decimal places
    }
    return 0;
  }

}
